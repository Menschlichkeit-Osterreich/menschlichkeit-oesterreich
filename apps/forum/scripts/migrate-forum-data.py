#!/usr/bin/env python3
"""
Menschlichkeit Österreich — Forum-Daten-Migration
Migriert bestehende Forum-Daten aus der FastAPI-Datenbank (menschlichkeit_dev)
in die phpBB-Datenbank (phpbb).

Voraussetzungen:
  1. phpBB Web-Installer muss bereits abgeschlossen sein
  2. Beide Datenbanken müssen erreichbar sein
  3. pip install psycopg2-binary

Verwendung:
  python migrate-forum-data.py [--dry-run] [--verbose]

  --dry-run   Zeigt an, was migriert würde, ohne Änderungen vorzunehmen
  --verbose   Detaillierte Ausgabe
"""

import argparse
import sys
from datetime import datetime, timezone

try:
    import psycopg2
    import psycopg2.extras
except ImportError:
    print("FEHLER: psycopg2 nicht installiert.")
    print("  pip install psycopg2-binary")
    sys.exit(1)


# ── Konfiguration ────────────────────────────────────────────
SOURCE_DB = {
    "host": "localhost",
    "port": 5432,
    "dbname": "menschlichkeit_dev",
    "user": "postgres",
    "password": "postgres",
}

TARGET_DB = {
    "host": "localhost",
    "port": 5432,
    "dbname": "phpbb",
    "user": "phpbb",
    "password": "phpbb_dev",
}

# Mapping: alte Kategorie-Namen → phpBB forum_id
# phpBB erstellt beim Install bereits ein Standard-Forum (id=1 "Your first category", id=2 "Your first forum")
# Wir erstellen neue Foren ab ID 3
CATEGORY_START_ID = 2  # phpBB "Your first category" (Eltern-Forum)

# Fallback-User für migrierte Beiträge ohne phpBB-Account
MIGRATION_USER_NAME = "Migrierter_Benutzer"
MIGRATION_USER_ID = None  # Wird beim Lauf gesetzt


def connect_source():
    """Verbindung zur Quell-Datenbank (menschlichkeit_dev)."""
    return psycopg2.connect(**SOURCE_DB)


def connect_target():
    """Verbindung zur phpBB-Datenbank."""
    return psycopg2.connect(**TARGET_DB)


def get_source_data(conn):
    """Liest alle Forum-Daten aus der Quell-DB."""
    with conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as cur:
        # Kategorien
        cur.execute("""
            SELECT id, name, beschreibung, erstellt_am
            FROM forum_categories
            ORDER BY name
        """)
        categories = cur.fetchall()

        # Threads mit Autor-Info
        cur.execute("""
            SELECT t.id, t.titel, t.kategorie_id, t.autor_id, t.status,
                   t.erstellt_am, t.aktualisiert_am,
                   m.vorname, m.nachname, m.email
            FROM forum_threads t
            LEFT JOIN members m ON t.autor_id = m.id
            ORDER BY t.erstellt_am
        """)
        threads = cur.fetchall()

        # Posts mit Autor-Info
        cur.execute("""
            SELECT p.id, p.thread_id, p.inhalt, p.autor_id, p.erstellt_am,
                   m.vorname, m.nachname, m.email
            FROM forum_posts p
            LEFT JOIN members m ON p.autor_id = m.id
            ORDER BY p.erstellt_am
        """)
        posts = cur.fetchall()

    return categories, threads, posts


def unix_timestamp(dt):
    """Konvertiert datetime zu Unix-Timestamp für phpBB."""
    if dt is None:
        return int(datetime.now(timezone.utc).timestamp())
    if dt.tzinfo is None:
        dt = dt.replace(tzinfo=timezone.utc)
    return int(dt.timestamp())


def ensure_migration_user(conn):
    """Erstellt einen Migrations-Benutzer in phpBB falls nötig."""
    global MIGRATION_USER_ID
    with conn.cursor() as cur:
        cur.execute(
            "SELECT user_id FROM phpbb_users WHERE username = %s",
            (MIGRATION_USER_NAME,)
        )
        row = cur.fetchone()
        if row:
            MIGRATION_USER_ID = row[0]
        else:
            # Nächste freie user_id
            cur.execute("SELECT COALESCE(MAX(user_id), 1) + 1 FROM phpbb_users")
            next_id = cur.fetchone()[0]
            now = unix_timestamp(None)
            cur.execute("""
                INSERT INTO phpbb_users (
                    user_id, user_type, group_id, username, username_clean,
                    user_regdate, user_password, user_email, user_lang,
                    user_timezone, user_dateformat, user_colour
                ) VALUES (
                    %s, 0, 2, %s, %s, %s, '', 'migration@menschlichkeit-oesterreich.at',
                    'de_x_sie', 'Europe/Vienna', 'd.m.Y, H:i', ''
                )
            """, (next_id, MIGRATION_USER_NAME, MIGRATION_USER_NAME.lower(), now))
            MIGRATION_USER_ID = next_id
            conn.commit()
    return MIGRATION_USER_ID


def migrate_categories(conn, categories, dry_run=False, verbose=False):
    """Migriert Kategorien als phpBB-Foren."""
    forum_map = {}  # alte UUID → neue phpBB forum_id

    with conn.cursor() as cur:
        # Nächste freie forum_id
        cur.execute("SELECT COALESCE(MAX(forum_id), 0) + 1 FROM phpbb_forums")
        next_id = cur.fetchone()[0]

        for i, cat in enumerate(categories):
            forum_id = next_id + i
            forum_map[str(cat["id"])] = forum_id

            if verbose:
                print(f"  Kategorie: {cat['name']} → forum_id {forum_id}")

            if not dry_run:
                cur.execute("""
                    INSERT INTO phpbb_forums (
                        forum_id, parent_id, left_id, right_id,
                        forum_name, forum_desc, forum_type,
                        forum_status, forum_posts_approved,
                        forum_topics_approved, forum_last_post_time
                    ) VALUES (
                        %s, %s, %s, %s, %s, %s, 1, 0, 0, 0, 0
                    )
                """, (
                    forum_id,
                    CATEGORY_START_ID,  # Parent: "Your first category"
                    (i * 2) + 100,      # left_id (Platzhalter, Resync nötig)
                    (i * 2) + 101,      # right_id
                    cat["name"],
                    cat["beschreibung"] or "",
                ))

        if not dry_run:
            conn.commit()

    print(f"  → {len(categories)} Kategorien migriert.")
    return forum_map


def migrate_threads_and_posts(conn, threads, posts, forum_map, dry_run=False, verbose=False):
    """Migriert Threads und Posts nach phpBB."""
    topic_map = {}  # alte Thread-UUID → neue phpBB topic_id
    posts_by_thread = {}

    # Posts nach Thread gruppieren
    for post in posts:
        tid = str(post["thread_id"])
        if tid not in posts_by_thread:
            posts_by_thread[tid] = []
        posts_by_thread[tid].append(post)

    with conn.cursor() as cur:
        # Nächste freie IDs
        cur.execute("SELECT COALESCE(MAX(topic_id), 0) + 1 FROM phpbb_topics")
        next_topic_id = cur.fetchone()[0]

        cur.execute("SELECT COALESCE(MAX(post_id), 0) + 1 FROM phpbb_posts")
        next_post_id = cur.fetchone()[0]

        for i, thread in enumerate(threads):
            topic_id = next_topic_id + i
            old_thread_id = str(thread["id"])
            kategorie_id = str(thread["kategorie_id"])
            forum_id = forum_map.get(kategorie_id)

            if forum_id is None:
                print(f"  WARNUNG: Kategorie {kategorie_id} nicht gemappt, Thread '{thread['titel']}' übersprungen.")
                continue

            topic_map[old_thread_id] = topic_id
            poster_name = f"{thread.get('vorname', 'Unbekannt')} {thread.get('nachname', '')}"
            post_time = unix_timestamp(thread["erstellt_am"])

            # Topic-Status: locked wenn status != 'offen'
            topic_status = 1 if thread.get("status") != "offen" else 0

            if verbose:
                print(f"  Thread: '{thread['titel']}' → topic_id {topic_id} (forum {forum_id})")

            if not dry_run:
                # Topic erstellen
                cur.execute("""
                    INSERT INTO phpbb_topics (
                        topic_id, forum_id, topic_title, topic_poster,
                        topic_time, topic_status, topic_type,
                        topic_first_poster_name, topic_last_poster_name,
                        topic_last_post_time, topic_posts_approved,
                        topic_visibility
                    ) VALUES (
                        %s, %s, %s, %s, %s, %s, 0, %s, %s, %s, 0, 1
                    )
                """, (
                    topic_id, forum_id, thread["titel"],
                    MIGRATION_USER_ID, post_time, topic_status,
                    poster_name, poster_name, post_time,
                ))

            # Posts für diesen Thread migrieren
            thread_posts = posts_by_thread.get(old_thread_id, [])
            post_count = 0

            for post in thread_posts:
                post_id = next_post_id
                next_post_id += 1
                post_count += 1
                pp_name = f"{post.get('vorname', 'Unbekannt')} {post.get('nachname', '')}"
                pp_time = unix_timestamp(post["erstellt_am"])

                if not dry_run:
                    cur.execute("""
                        INSERT INTO phpbb_posts (
                            post_id, topic_id, forum_id, poster_id,
                            post_time, post_text, post_username,
                            post_subject, bbcode_bitfield, bbcode_uid,
                            post_visibility
                        ) VALUES (
                            %s, %s, %s, %s, %s, %s, %s, %s, '', '', 1
                        )
                    """, (
                        post_id, topic_id, forum_id,
                        MIGRATION_USER_ID, pp_time,
                        post["inhalt"], pp_name,
                        f"Re: {thread['titel']}",
                    ))

            # Topic-Statistiken aktualisieren
            if not dry_run and post_count > 0:
                cur.execute("""
                    UPDATE phpbb_topics
                    SET topic_posts_approved = %s
                    WHERE topic_id = %s
                """, (post_count, topic_id))

        if not dry_run:
            conn.commit()

    total_posts = sum(len(v) for v in posts_by_thread.values())
    print(f"  → {len(threads)} Threads und {total_posts} Posts migriert.")
    return topic_map


def main():
    parser = argparse.ArgumentParser(
        description="Migriert Forum-Daten von FastAPI nach phpBB"
    )
    parser.add_argument("--dry-run", action="store_true",
                        help="Keine Änderungen vornehmen")
    parser.add_argument("--verbose", "-v", action="store_true",
                        help="Detaillierte Ausgabe")
    args = parser.parse_args()

    print("=" * 60)
    print("  MÖ Forum-Migration: FastAPI → phpBB")
    if args.dry_run:
        print("  ⚠  DRY-RUN Modus — keine Änderungen")
    print("=" * 60)

    # 1. Quell-Daten lesen
    print("\n[1/4] Quell-Daten aus menschlichkeit_dev lesen...")
    try:
        src_conn = connect_source()
        categories, threads, posts = get_source_data(src_conn)
        src_conn.close()
    except Exception as e:
        print(f"  FEHLER: Verbindung zur Quell-DB fehlgeschlagen: {e}")
        sys.exit(1)

    print(f"  Gefunden: {len(categories)} Kategorien, {len(threads)} Threads, {len(posts)} Posts")

    if not categories:
        print("\n  Keine Daten zu migrieren. Abbruch.")
        sys.exit(0)

    # 2. phpBB-Verbindung
    print("\n[2/4] Verbindung zur phpBB-Datenbank...")
    try:
        tgt_conn = connect_target()
    except Exception as e:
        print(f"  FEHLER: Verbindung zur phpBB-DB fehlgeschlagen: {e}")
        print("  Ist phpBB bereits installiert? (Web-Installer ausführen)")
        sys.exit(1)

    # 3. Migrations-User erstellen
    print("\n[3/4] Migrations-User sicherstellen...")
    if not args.dry_run:
        ensure_migration_user(tgt_conn)
        print(f"  → User '{MIGRATION_USER_NAME}' (ID: {MIGRATION_USER_ID})")
    else:
        print(f"  → (dry-run) User '{MIGRATION_USER_NAME}' würde erstellt")

    # 4. Kategorien migrieren
    print("\n[4/4] Daten migrieren...")
    print("  Kategorien:")
    forum_map = migrate_categories(tgt_conn, categories, args.dry_run, args.verbose)

    # 5. Threads + Posts migrieren
    print("  Threads & Posts:")
    migrate_threads_and_posts(tgt_conn, threads, posts, forum_map, args.dry_run, args.verbose)

    tgt_conn.close()

    # Abschluss
    print("\n" + "=" * 60)
    print("  Migration abgeschlossen!")
    print("=" * 60)
    print()
    print("WICHTIG — Nächste Schritte:")
    print("  1. phpBB-Statistiken resynchronisieren:")
    print("     npm run dev:forum:cli -- db:recount")
    print("     Oder: ACP > Maintenance > Resynchronize statistics")
    print()
    print("  2. phpBB-Forenstruktur (left/right IDs) reparieren:")
    print("     ACP > Maintenance > Resynchronize statistics > Resynchronize all")
    print()
    if not args.dry_run:
        print("  3. FastAPI Forum-Router kann nun deaktiviert werden:")
        print("     apps/api/app/routers/forum.py (Router-Import entfernen)")
    print()


if __name__ == "__main__":
    main()
