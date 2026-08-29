"""Merge the community and webhook-hardening Alembic heads.

Revision: 007
Revises: 004, 006

This is intentionally a pure merge revision.  The two historic branches are
already deployed candidates and must not be rewritten.
"""

revision = "007"
down_revision = ("004", "006")
branch_labels = None
depends_on = None


def upgrade() -> None:
    """Merge-only revision; schema changes begin in 008."""


def downgrade() -> None:
    """Merge-only revision; no schema change to reverse."""

