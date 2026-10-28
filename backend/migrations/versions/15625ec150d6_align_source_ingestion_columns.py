"""align_source_ingestion_columns

Revision ID: 15625ec150d6
Revises: 385380413e6b
Create Date: 2026-10-28 03:10:41.128910

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '15625ec150d6'
down_revision: Union[str, Sequence[str], None] = '385380413e6b'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.execute("ALTER TABLE source_ingestions ADD COLUMN IF NOT EXISTS source_name VARCHAR(100) DEFAULT 'Unknown'")
    op.execute("ALTER TABLE source_ingestions ADD COLUMN IF NOT EXISTS records_found INTEGER DEFAULT 0")
    op.execute("ALTER TABLE source_ingestions ADD COLUMN IF NOT EXISTS records_indexed INTEGER DEFAULT 0")
    op.execute("ALTER TABLE source_ingestions ADD COLUMN IF NOT EXISTS error_message TEXT")
    op.execute("ALTER TABLE source_ingestions ALTER COLUMN url DROP NOT NULL")
    op.execute("ALTER TABLE source_ingestions ALTER COLUMN stage DROP NOT NULL")


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_column('source_ingestions', 'error_message')
    op.drop_column('source_ingestions', 'records_indexed')
    op.drop_column('source_ingestions', 'records_found')
    op.drop_column('source_ingestions', 'source_name')
