# Operations

Provision least-privilege PostgreSQL, copy `.env.example`, replace credentials and set a random 32+ character JWT secret. Install dependencies intentionally and apply `./scripts/migrate.sh`; `./start.sh` never installs, seeds, creates databases, kills ports or mutates schema.

For an explicitly enabled local demo, set `ENABLE_DEMO_CREDENTIAL_AUTOFILL=true`, `SEED_ADMIN_EMAIL`, and a unique 12+ character `SEED_ADMIN_PASSWORD` in the ignored `.env`. Run `npm --prefix backend run provision:demo` once (and whenever those values change), then launch with `./start.sh`. The frontend autofill button receives those values only in non-production demo mode; it is disabled otherwise. Never reuse the local demo password for a real account.

Monitor telemetry sequence gaps, failed/dead-letter device deliveries, comfort violations, device failures and rollback rate. Never infer dispatch success from a timeout. Preserve local/manual control, enter recovery on stale data or lost connectivity, reconcile authoritative receipts and require owner/operator review before redispatch. This repository has not been hardware/provider validated; AI/gap routes are quarantined.
