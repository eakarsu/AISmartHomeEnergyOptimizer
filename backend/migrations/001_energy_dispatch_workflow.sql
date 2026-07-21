BEGIN;
CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE TABLE IF NOT EXISTS energy_telemetry (
  id BIGSERIAL PRIMARY KEY, tenant_id TEXT NOT NULL, site_id TEXT NOT NULL, source TEXT NOT NULL, source_sequence BIGINT NOT NULL,
  observed_at TIMESTAMPTZ NOT NULL, values JSONB NOT NULL, quality TEXT NOT NULL, provenance JSONB NOT NULL, UNIQUE(tenant_id,source,site_id,source_sequence)
);
CREATE TABLE IF NOT EXISTS energy_dispatch_cases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(), tenant_id TEXT NOT NULL, site_id TEXT NOT NULL, owner_id TEXT NOT NULL,
  idempotency_key TEXT NOT NULL, stage TEXT NOT NULL DEFAULT 'observed', version INTEGER NOT NULL DEFAULT 1, constraints JSONB NOT NULL,
  objective JSONB NOT NULL, plan JSONB, created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(tenant_id,idempotency_key), CHECK(stage IN ('observed','validated','forecasted','planned','owner_review','approved','dispatched','applied','measured','recovered','closed'))
);
CREATE INDEX IF NOT EXISTS energy_dispatch_cases_tenant_stage_idx ON energy_dispatch_cases(tenant_id,site_id,stage,updated_at DESC);
CREATE TABLE IF NOT EXISTS energy_integration_deliveries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(), tenant_id TEXT NOT NULL, case_id UUID REFERENCES energy_dispatch_cases(id), provider TEXT NOT NULL,
  operation TEXT NOT NULL, idempotency_key TEXT NOT NULL, status TEXT NOT NULL DEFAULT 'pending', attempt_count INTEGER NOT NULL DEFAULT 0,
  next_attempt_at TIMESTAMPTZ, request JSONB NOT NULL DEFAULT '{}', receipt JSONB, last_error TEXT, UNIQUE(tenant_id,provider,idempotency_key),
  CHECK(status IN ('pending','sent','acknowledged','failed','dead_letter','reconciled'))
);
CREATE TABLE IF NOT EXISTS energy_evaluations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(), tenant_id TEXT NOT NULL, corpus_version TEXT NOT NULL, cost_delta NUMERIC,
  peak_kw_delta NUMERIC, comfort_violations INTEGER NOT NULL DEFAULT 0, device_failures INTEGER NOT NULL DEFAULT 0,
  rollback_rate NUMERIC, passed BOOLEAN NOT NULL, details JSONB NOT NULL DEFAULT '{}', evaluated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS energy_workflow_audit (
  id BIGSERIAL PRIMARY KEY, tenant_id TEXT NOT NULL, case_id UUID, actor_id TEXT NOT NULL, action TEXT NOT NULL,
  from_stage TEXT, to_stage TEXT, payload JSONB NOT NULL DEFAULT '{}', occurred_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE OR REPLACE FUNCTION energy_workflow_audit_immutable() RETURNS trigger LANGUAGE plpgsql AS $$BEGIN RAISE EXCEPTION 'energy workflow audit is append-only'; END; $$;
DROP TRIGGER IF EXISTS energy_workflow_audit_no_mutation ON energy_workflow_audit;
CREATE TRIGGER energy_workflow_audit_no_mutation BEFORE UPDATE OR DELETE ON energy_workflow_audit FOR EACH ROW EXECUTE FUNCTION energy_workflow_audit_immutable();
COMMIT;
