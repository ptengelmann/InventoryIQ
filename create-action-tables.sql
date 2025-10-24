-- ENTERPRISE ACTION SYSTEM TABLES
-- Create these tables manually in Supabase SQL Editor if prisma db push times out

-- Table 1: Actions (main audit trail)
CREATE TABLE IF NOT EXISTS "actions" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "user_id" TEXT NOT NULL,
    "action_type" TEXT NOT NULL,
    "target_sku" TEXT,
    "target_skus" JSONB,
    "action_payload" JSONB NOT NULL,
    "reason" TEXT NOT NULL,
    "expected_impact" DOUBLE PRECISION,
    "confidence_score" DOUBLE PRECISION,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "initiated_by" TEXT NOT NULL,
    "initiated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "validated_at" TIMESTAMP(3),
    "executed_at" TIMESTAMP(3),
    "completed_at" TIMESTAMP(3),
    "requires_approval" BOOLEAN NOT NULL DEFAULT false,
    "approved_by" TEXT,
    "approved_at" TIMESTAMP(3),
    "actual_impact" DOUBLE PRECISION,
    "success_metrics" JSONB,
    "error_message" TEXT,
    "rollback_data" JSONB NOT NULL,
    "rolled_back" BOOLEAN NOT NULL DEFAULT false,
    "rolled_back_at" TIMESTAMP(3),
    "rolled_back_by" TEXT,
    "external_refs" JSONB,
    "affected_systems" TEXT[],
    "sync_status" JSONB,
    "batch_id" TEXT
);

-- Table 2: Action Validation Rules (configurable business logic)
CREATE TABLE IF NOT EXISTS "action_validation_rules" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "user_id" TEXT NOT NULL,
    "action_type" TEXT NOT NULL,
    "rule_type" TEXT NOT NULL,
    "rule_config" JSONB NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "priority" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Table 3: Action Batches (for bulk operations)
CREATE TABLE IF NOT EXISTS "action_batches" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "user_id" TEXT NOT NULL,
    "batch_name" TEXT NOT NULL,
    "batch_type" TEXT NOT NULL,
    "action_ids" TEXT[],
    "total_actions" INTEGER NOT NULL,
    "completed" INTEGER NOT NULL DEFAULT 0,
    "failed" INTEGER NOT NULL DEFAULT 0,
    "pending" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "execute_parallel" BOOLEAN NOT NULL DEFAULT false,
    "max_concurrent" INTEGER NOT NULL DEFAULT 5,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "started_at" TIMESTAMP(3),
    "completed_at" TIMESTAMP(3)
);

-- Table 4: Action Approvals (for high-risk actions)
CREATE TABLE IF NOT EXISTS "action_approvals" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "action_id" TEXT NOT NULL UNIQUE,
    "requester_id" TEXT NOT NULL,
    "approver_id" TEXT,
    "approval_status" TEXT NOT NULL DEFAULT 'pending',
    "approval_reason" TEXT NOT NULL,
    "risk_level" TEXT NOT NULL,
    "estimated_impact" DOUBLE PRECISION,
    "requested_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reviewed_at" TIMESTAMP(3),
    "auto_approved" BOOLEAN NOT NULL DEFAULT false
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS "actions_user_id_idx" ON "actions"("user_id");
CREATE INDEX IF NOT EXISTS "actions_status_idx" ON "actions"("status");
CREATE INDEX IF NOT EXISTS "actions_action_type_idx" ON "actions"("action_type");
CREATE INDEX IF NOT EXISTS "actions_initiated_at_idx" ON "actions"("initiated_at");
CREATE INDEX IF NOT EXISTS "actions_batch_id_idx" ON "actions"("batch_id");

CREATE INDEX IF NOT EXISTS "action_validation_rules_user_id_idx" ON "action_validation_rules"("user_id");
CREATE INDEX IF NOT EXISTS "action_validation_rules_action_type_idx" ON "action_validation_rules"("action_type");

CREATE INDEX IF NOT EXISTS "action_batches_user_id_idx" ON "action_batches"("user_id");
CREATE INDEX IF NOT EXISTS "action_batches_status_idx" ON "action_batches"("status");

CREATE INDEX IF NOT EXISTS "action_approvals_action_id_idx" ON "action_approvals"("action_id");
CREATE INDEX IF NOT EXISTS "action_approvals_approval_status_idx" ON "action_approvals"("approval_status");

-- Foreign key constraint
ALTER TABLE "actions" ADD CONSTRAINT "actions_batch_id_fkey" FOREIGN KEY ("batch_id") REFERENCES "action_batches"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Success message
SELECT 'Enterprise Action System tables created successfully!' as message;
