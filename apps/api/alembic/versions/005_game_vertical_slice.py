"""005 – Game vertical slice tables.

Revision: 005
Erstellt: 2026-03-30

Fuegt die Persistenz fuer den ersten Babylon-Game-Vertical-Slice hinzu:
  - game_profiles
  - game_progress
  - game_events
"""

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import JSONB, UUID

revision = "005"
down_revision = "004a"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "game_profiles",
        sa.Column(
            "member_id",
            UUID(),
            sa.ForeignKey("members.id", ondelete="CASCADE"),
            primary_key=True,
        ),
        sa.Column("selected_role", sa.Text(), nullable=False, server_default="buerger"),
        sa.Column(
            "current_world_id", sa.Text(), nullable=False, server_default="gemeinde"
        ),
        sa.Column("resume_scenario_id", sa.Text(), nullable=True),
        sa.Column(
            "settings", JSONB(), nullable=False, server_default=sa.text("'{}'::jsonb")
        ),
        sa.Column(
            "stats", JSONB(), nullable=False, server_default=sa.text("'{}'::jsonb")
        ),
        sa.Column(
            "world_state",
            JSONB(),
            nullable=False,
            server_default=sa.text("'{}'::jsonb"),
        ),
        sa.Column("total_xp", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("player_level", sa.Integer(), nullable=False, server_default="1"),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.text("NOW()"),
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.text("NOW()"),
        ),
    )

    op.create_table(
        "game_progress",
        sa.Column(
            "id", UUID(), primary_key=True, server_default=sa.text("gen_random_uuid()")
        ),
        sa.Column(
            "member_id",
            UUID(),
            sa.ForeignKey("members.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column("scenario_id", sa.Text(), nullable=False),
        sa.Column("world_id", sa.Text(), nullable=False),
        sa.Column("role_id", sa.Text(), nullable=False),
        sa.Column("choice_id", sa.Text(), nullable=False),
        sa.Column("score", sa.Integer(), nullable=False),
        sa.Column("xp_awarded", sa.Integer(), nullable=False),
        sa.Column(
            "used_signature_action",
            sa.Boolean(),
            nullable=False,
            server_default="false",
        ),
        sa.Column(
            "stats_delta",
            JSONB(),
            nullable=False,
            server_default=sa.text("'{}'::jsonb"),
        ),
        sa.Column(
            "world_delta",
            JSONB(),
            nullable=False,
            server_default=sa.text("'{}'::jsonb"),
        ),
        sa.Column(
            "world_state_after",
            JSONB(),
            nullable=False,
            server_default=sa.text("'{}'::jsonb"),
        ),
        sa.Column(
            "completed_at",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.text("NOW()"),
        ),
        sa.UniqueConstraint(
            "member_id", "scenario_id", name="uq_game_progress_member_scenario"
        ),
    )
    op.create_index("ix_game_progress_member_id", "game_progress", ["member_id"])
    op.create_index("ix_game_progress_world_id", "game_progress", ["world_id"])

    op.create_table(
        "game_events",
        sa.Column(
            "id", UUID(), primary_key=True, server_default=sa.text("gen_random_uuid()")
        ),
        sa.Column(
            "member_id",
            UUID(),
            sa.ForeignKey("members.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column("session_id", sa.Text(), nullable=True),
        sa.Column("event_type", sa.Text(), nullable=False),
        sa.Column(
            "payload", JSONB(), nullable=False, server_default=sa.text("'{}'::jsonb")
        ),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.text("NOW()"),
        ),
    )
    op.create_index("ix_game_events_member_id", "game_events", ["member_id"])
    op.create_index("ix_game_events_event_type", "game_events", ["event_type"])


def downgrade() -> None:
    op.drop_index("ix_game_events_event_type", table_name="game_events")
    op.drop_index("ix_game_events_member_id", table_name="game_events")
    op.drop_table("game_events")

    op.drop_index("ix_game_progress_world_id", table_name="game_progress")
    op.drop_index("ix_game_progress_member_id", table_name="game_progress")
    op.drop_table("game_progress")

    op.drop_table("game_profiles")
