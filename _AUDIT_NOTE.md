# Audit Note — AISmartHomeEnergyOptimizer

Source: `/Users/erolakarsu/projects/_AUDIT/reports/batch_07.md` (section 34).

## Original Recommendations

### Missing AI Endpoints
- `/consumption-forecast` (predict energy use)
- `/equipment-scheduling` (when to run laundry, EV charge)
- `/rate-optimization` (load shifting for time-of-use rates)
- `/solar-forecast` (predict generation)
- `/battery-management-optimization` (charge/discharge timing)
- `/demand-response-automation` (participate in grid services)

### Missing Non-AI Features
- Smart device integration (Nest, Tesla, Ecobee)
- Real-time monitoring dashboard
- Energy provider integration
- Renewable generation integration
- Home automation triggers

### Custom Feature Suggestions
- Load shifting optimizer
- Renewable + battery coordination
- Demand response automation
- Appliance lifetime optimization
- Whole-home energy resilience
- Behavioral energy coaching

## Implemented (this round)
1. `POST /api/ai/consumption-forecast` — predict near-term household kWh consumption.
2. `POST /api/ai/equipment-scheduling` — load-shifting recommendations using utility rates.
3. `POST /api/ai/solar-forecast` — predict solar generation for next N days.

All three follow the existing OpenRouter `queryAI` + `parseAIJson` + `persistAIResult` pattern, are gated by `authenticateToken` + `aiRateLimiter`, and use `express-validator`. Syntax-checked with `node --check`.

## Backlog (prioritized)
1. **MECHANICAL** `POST /api/ai/rate-optimization` — similar pattern, focus on TOU rate schedules.
2. **MECHANICAL** `POST /api/ai/battery-management-optimization` — needs `batteries` data join.
3. **MECHANICAL** `POST /api/ai/demand-response-automation` — needs DR signal schema.
4. **NEEDS-CREDS** Smart device integrations (Nest/Tesla/Ecobee APIs).
5. **NEEDS-CREDS** Utility provider API integration.
6. **NEEDS-PRODUCT-DECISION** Real-time monitoring dashboard, home automation trigger DSL.

## Apply pass 3 (frontend)

LEFT-AS-IS. Frontend already wires the AI endpoints implemented in apply pass 2 (JWT Bearer auth from localStorage, 503-no-key handling via backend, existing styling). No changes required.

## Apply pass 4 (mechanical backlog)

NO CHANGES. All three mechanical backlog endpoints are already fully implemented BE+FE:
- `POST /api/ai/rate-optimization` — `backend/routes/ai.js` (with explicit 503-on-no-key); `frontend/src/pages/RateOptimizationPage.jsx` is routed in `App.jsx` and listed in `Layout.jsx` sidebar.
- `POST /api/ai/battery-management-optimization` — `backend/routes/ai.js` (503-on-no-key); `frontend/src/pages/BatteryManagementPage.jsx` is routed in `App.jsx`.
- `POST /api/ai/demand-response-automation` — `backend/routes/ai.js` (503-on-no-key); `frontend/src/pages/DemandResponsePage.jsx` is routed in `App.jsx`.
Remaining backlog items are NEEDS-CREDS (Nest/Tesla/Ecobee, utility provider APIs) or NEEDS-PRODUCT-DECISION (real-time monitoring, automation trigger DSL).
