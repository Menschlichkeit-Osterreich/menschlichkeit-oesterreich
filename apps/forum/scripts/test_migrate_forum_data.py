from __future__ import annotations

import importlib.util
import sys
import types
from datetime import datetime, timezone
from pathlib import Path


def _load_module():
    script_path = Path(__file__).with_name("migrate-forum-data.py")

    fake_psycopg2 = types.ModuleType("psycopg2")
    fake_psycopg2.connect = lambda **kwargs: None
    fake_extras = types.ModuleType("psycopg2.extras")
    fake_extras.RealDictCursor = object
    fake_psycopg2.extras = fake_extras

    old_psycopg2 = sys.modules.get("psycopg2")
    old_psycopg2_extras = sys.modules.get("psycopg2.extras")
    sys.modules["psycopg2"] = fake_psycopg2
    sys.modules["psycopg2.extras"] = fake_extras

    try:
        spec = importlib.util.spec_from_file_location("migrate_forum_data", script_path)
        assert spec is not None
        assert spec.loader is not None
        module = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(module)
        return module
    finally:
        if old_psycopg2 is not None:
            sys.modules["psycopg2"] = old_psycopg2
        else:
            sys.modules.pop("psycopg2", None)

        if old_psycopg2_extras is not None:
            sys.modules["psycopg2.extras"] = old_psycopg2_extras
        else:
            sys.modules.pop("psycopg2.extras", None)


class FakeCursor:
    def __init__(self, fetch_values):
        self.fetch_values = list(fetch_values)
        self.executed = []

    def __enter__(self):
        return self

    def __exit__(self, exc_type, exc_val, exc_tb):
        return False

    def execute(self, query, params=None):
        self.executed.append((query.strip(), params))

    def fetchone(self):
        return self.fetch_values.pop(0)


class FakeConn:
    def __init__(self, fetch_values):
        self.cursor_instance = FakeCursor(fetch_values)
        self.committed = False

    def cursor(self, *args, **kwargs):
        return self.cursor_instance

    def commit(self):
        self.committed = True


def test_unix_timestamp_handles_none_and_naive_datetime():
    module = _load_module()

    now_ts = module.unix_timestamp(None)
    assert isinstance(now_ts, int)

    naive = datetime(2026, 1, 1, 12, 0, 0)
    aware = datetime(2026, 1, 1, 12, 0, 0, tzinfo=timezone.utc)

    assert module.unix_timestamp(naive) == module.unix_timestamp(aware)


def test_migrate_categories_creates_forum_map_in_dry_run():
    module = _load_module()
    conn = FakeConn(fetch_values=[(10,)])

    categories = [
        {"id": "cat-a", "name": "Allgemein", "beschreibung": "Forum A"},
        {"id": "cat-b", "name": "Mitmachen", "beschreibung": "Forum B"},
    ]

    forum_map = module.migrate_categories(conn, categories, dry_run=True, verbose=False)

    assert forum_map == {"cat-a": 10, "cat-b": 11}
    assert conn.committed is False


def test_migrate_threads_skips_unmapped_categories(capsys):
    module = _load_module()
    module.MIGRATION_USER_ID = 777
    conn = FakeConn(fetch_values=[(100,), (200,)])

    threads = [
        {
            "id": "thread-1",
            "titel": "Diskussion",
            "kategorie_id": "missing-cat",
            "status": "offen",
            "erstellt_am": datetime(2026, 1, 2, tzinfo=timezone.utc),
            "vorname": "Max",
            "nachname": "Muster",
        }
    ]
    posts = []

    topic_map = module.migrate_threads_and_posts(
        conn,
        threads,
        posts,
        forum_map={},
        dry_run=True,
        verbose=False,
    )

    out = capsys.readouterr().out
    assert "WARNUNG: Kategorie missing-cat nicht gemappt" in out
    assert topic_map == {}
