"""004 – Community-Tabellen: blog, events, forum, newsletter-schema

Revision: 004
Erstellt: 2026-03-28
Konsolidiert: Inline CREATE TABLE IF NOT EXISTS aus blog.py, events.py,
              forum.py und newsletter.py in eine versionierte Migration.

Erstellt:
  - blog_articles
  - forum_categories, forum_threads, forum_posts
  - ALTER newsletter_subscriptions ADD COLUMN token_created_at
"""

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import UUID, JSONB

revision = "004"
down_revision = "003"
branch_labels = None
depends_on = None


def upgrade() -> None:
    # ── blog_articles ─────────────────────────────────────────────────────────
    op.create_table(
        "blog_articles",
        sa.Column(
            "id", UUID(), primary_key=True, server_default=sa.text("gen_random_uuid()")
        ),
        sa.Column("titel", sa.Text(), nullable=False),
        sa.Column("inhalt", sa.Text(), nullable=False),
        sa.Column("zusammenfassung", sa.Text(), nullable=True),
        sa.Column("kategorie", sa.Text(), nullable=False, server_default="Allgemein"),
        sa.Column("tags", JSONB(), server_default=sa.text("'[]'::jsonb")),
        sa.Column("autor_id", UUID(), nullable=False),
        sa.Column("veroeffentlicht", sa.Boolean(), server_default="false"),
        sa.Column("seo_title", sa.Text(), nullable=True),
        sa.Column("seo_description", sa.Text(), nullable=True),
        sa.Column("og_image", sa.Text(), nullable=True),
        sa.Column(
            "created_at", sa.DateTime(timezone=True), server_default=sa.text("NOW()")
        ),
        sa.Column(
            "updated_at", sa.DateTime(timezone=True), server_default=sa.text("NOW()")
        ),
    )

    # ── forum_categories ──────────────────────────────────────────────────────
    op.create_table(
        "forum_categories",
        sa.Column(
            "id", UUID(), primary_key=True, server_default=sa.text("gen_random_uuid()")
        ),
        sa.Column("name", sa.Text(), nullable=False),
        sa.Column("beschreibung", sa.Text(), nullable=True),
        sa.Column("sort_order", sa.Integer(), server_default="0"),
        sa.Column(
            "created_at", sa.DateTime(timezone=True), server_default=sa.text("NOW()")
        ),
    )

    # ── forum_threads ─────────────────────────────────────────────────────────
    op.create_table(
        "forum_threads",
        sa.Column(
            "id", UUID(), primary_key=True, server_default=sa.text("gen_random_uuid()")
        ),
        sa.Column(
            "category_id", UUID(), sa.ForeignKey("forum_categories.id"), nullable=True
        ),
        sa.Column("titel", sa.Text(), nullable=False),
        sa.Column("inhalt", sa.Text(), nullable=False),
        sa.Column("autor_id", UUID(), nullable=False),
        sa.Column("is_pinned", sa.Boolean(), server_default="false"),
        sa.Column("is_locked", sa.Boolean(), server_default="false"),
        sa.Column(
            "created_at", sa.DateTime(timezone=True), server_default=sa.text("NOW()")
        ),
        sa.Column(
            "updated_at", sa.DateTime(timezone=True), server_default=sa.text("NOW()")
        ),
    )

    # ── forum_posts ───────────────────────────────────────────────────────────
    op.create_table(
        "forum_posts",
        sa.Column(
            "id", UUID(), primary_key=True, server_default=sa.text("gen_random_uuid()")
        ),
        sa.Column(
            "thread_id",
            UUID(),
            sa.ForeignKey("forum_threads.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column("inhalt", sa.Text(), nullable=False),
        sa.Column("autor_id", UUID(), nullable=False),
        sa.Column(
            "created_at", sa.DateTime(timezone=True), server_default=sa.text("NOW()")
        ),
        sa.Column(
            "updated_at", sa.DateTime(timezone=True), server_default=sa.text("NOW()")
        ),
    )

    # ── newsletter_subscriptions: token_created_at ────────────────────────────
    op.add_column(
        "newsletter_subscriptions",
        sa.Column(
            "token_created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("NOW()"),
        ),
    )

    # ── forum_categories: Seed-Daten ────────────────────────────────────────
    #    Nur einfügen wenn Tabelle leer (idempotent bei erneutem Lauf)
    conn = op.get_bind()
    count = conn.execute(sa.text("SELECT COUNT(*) FROM forum_categories")).scalar()
    if not count:
        default_categories = [
            ("Allgemein", "Allgemeine Diskussionen rund um den Verein", 1),
            (
                "Demokratie & Politik",
                "Diskussionen zu Demokratie, Politik und Menschenrechten",
                2,
            ),
            ("Veranstaltungen", "Austausch zu Veranstaltungen und Events", 3),
            ("Bildung", "Bildungsthemen, Workshops und Materialien", 4),
            ("Technik & Plattform", "Fragen und Anregungen zur Plattform", 5),
        ]
        for name, beschreibung, sort_order in default_categories:
            conn.execute(
                sa.text(
                    "INSERT INTO forum_categories (id, name, beschreibung, sort_order) "
                    "VALUES (gen_random_uuid(), :name, :beschreibung, :sort_order)"
                ),
                {"name": name, "beschreibung": beschreibung, "sort_order": sort_order},
            )


def downgrade() -> None:
    op.drop_column("newsletter_subscriptions", "token_created_at")
    op.drop_table("forum_posts")
    op.drop_table("forum_threads")
    op.drop_table("forum_categories")
    op.drop_table("blog_articles")
