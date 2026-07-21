# Completeness review mapping

| Review requirement | Implementation |
|---|---|
| 1 | `energyWorkflow` persists monotonic observations, validation, forecast, constrained plan, owner review, independent approval, device dispatch, measurement, recovery and close. |
| 2 | Versioned device/utility/weather provenance and typed delivery records support idempotency, retries, receipts, reconciliation, dead letters and offline/manual recovery. |
| 3 | `energy_evaluations` captures versioned replay cost, peak load, comfort violations, device failures and rollback rate; tests cover replay and unsafe constraints. |
| 4 | Site tenancy, owner/operator roles, independent safety approval, manual override, append-only audit, optimistic versions and realized outcomes keep the homeowner in control. |
| 5 | The generated smart-device integration and all direct AI/gap routes are quarantined in favor of the canonical device workflow. |
| 6 | Pure tests, CI, additive migration, strong auth, explicit migration and non-mutating startup provide repeatable delivery without claiming hardware/provider validation. |
