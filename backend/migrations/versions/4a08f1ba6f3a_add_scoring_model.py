"""add_scoring_model

Revision ID: 4a08f1ba6f3a
Revises: 34da34914a27
Create Date: 2026-09-23 18:29:00.000000

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '4a08f1ba6f3a'
down_revision = '7dde33f7758e'
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table('analysis_scores',
    sa.Column('id', sa.String(length=36), nullable=False),
    sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
    sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
    sa.Column('analysis_id', sa.String(length=36), nullable=False),
    sa.Column('metric_name', sa.String(), nullable=False),
    sa.Column('score', sa.Float(), nullable=True),
    sa.Column('status', sa.String(), nullable=False),
    sa.Column('calculation_version', sa.String(), nullable=False),
    sa.Column('inputs', sa.JSON(), nullable=True),
    sa.Column('evidence_references', sa.JSON(), nullable=True),
    sa.Column('explanation', sa.Text(), nullable=True),
    sa.ForeignKeyConstraint(['analysis_id'], ['analyses.id'], ondelete='CASCADE'),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_index('ix_analysis_scores_analysis_id', 'analysis_scores', ['analysis_id'], unique=False)


def downgrade() -> None:
    op.drop_index('ix_analysis_scores_analysis_id', table_name='analysis_scores')
    op.drop_table('analysis_scores')
