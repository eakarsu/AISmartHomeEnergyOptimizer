const STAGES = Object.freeze(['observed','validated','forecasted','planned','owner_review','approved','dispatched','applied','measured','recovered','closed']);
const acknowledged = (receipt) => Boolean(receipt && receipt.provider && receipt.receipt_id && receipt.status === 'acknowledged' && !Number.isNaN(new Date(receipt.acknowledged_at).valueOf()));

function validateTelemetry(input, lastSequence) {
  for (const field of ['home_ref','device_ref','source_ref','schema_version','sequence','recorded_at','checksum']) if (input[field] === undefined || input[field] === null || input[field] === '') throw new Error(`${field} is required`);
  const sequence = Number(input.sequence);
  const recordedAt = new Date(input.recorded_at);
  const watts = Number(input.power_watts);
  if (!Number.isInteger(sequence) || Number.isNaN(recordedAt.valueOf()) || !Number.isFinite(watts) || watts < 0 || (lastSequence != null && sequence <= Number(lastSequence))) throw new Error('invalid or replayed energy telemetry');
  return { ...input, sequence, power_watts: watts, recorded_at: recordedAt.toISOString(), gap: lastSequence == null ? 0 : sequence - Number(lastSequence) - 1 };
}

function validatePlan(input) {
  for (const field of ['plan_ref','tariff_version','forecast_version','constraint_version']) if (!input[field]) throw new Error(`${field} is required`);
  const maxKw = Number(input.max_demand_kw);
  const expectedKw = Number(input.expected_peak_kw);
  if (!Number.isFinite(maxKw) || !Number.isFinite(expectedKw) || maxKw <= 0 || expectedKw < 0 || expectedKw > maxKw) throw new Error('energy safety constraint violated');
  return { max_demand_kw: maxKw, expected_peak_kw: expectedKw, manual_review: true };
}

function validateTransition(from, to, context = {}) {
  const allowed = { observed:['validated'], validated:['forecasted'], forecasted:['planned'], planned:['owner_review'], owner_review:['planned','approved'], approved:['dispatched'], dispatched:['applied'], applied:['measured','recovered'], measured:['closed','owner_review','recovered'], recovered:['owner_review','closed'], closed:[] };
  if (!allowed[from]?.includes(to)) throw new Error('invalid energy transition');
  if (['approved','dispatched'].includes(to) && !['home_owner','energy_operator','admin'].includes(context.role)) throw new Error('energy action authority required');
  if (to === 'approved' && (!context.safetyLimitsVerified || !context.manualOverride || context.actorId === context.createdBy)) throw new Error('independent safety approval and override required');
  if (to === 'dispatched' && !acknowledged(context.deviceReceipt)) throw new Error('typed acknowledged device receipt required');
  if (to === 'closed' && !context.realizedOutcome) throw new Error('realized outcome required');
  return true;
}

module.exports = { STAGES, validateTelemetry, validatePlan, validateTransition };
