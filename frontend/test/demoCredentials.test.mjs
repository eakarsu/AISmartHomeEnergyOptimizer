import test from 'node:test'
import assert from 'node:assert/strict'
import { resolveDemoCredentials } from '../src/config/demoCredentials.js'

test('demo credential autofill is disabled by default', () => {
  assert.deepEqual(resolveDemoCredentials(), {
    available: false,
    email: '',
    password: '',
    reason: 'Demo credential autofill is disabled.',
  })
})

test('enabled autofill fails closed when either configured value is missing', () => {
  assert.equal(resolveDemoCredentials({ VITE_ENABLE_DEMO_CREDENTIAL_AUTOFILL: 'true' }).available, false)
  assert.equal(resolveDemoCredentials({
    VITE_ENABLE_DEMO_CREDENTIAL_AUTOFILL: 'true',
    VITE_DEMO_EMAIL: 'demo@example.com',
  }).available, false)
})

test('enabled autofill returns the configured local demo account', () => {
  assert.deepEqual(resolveDemoCredentials({
    VITE_ENABLE_DEMO_CREDENTIAL_AUTOFILL: 'true',
    VITE_DEMO_EMAIL: ' demo@example.com ',
    VITE_DEMO_PASSWORD: 'local-password-value',
  }), {
    available: true,
    email: 'demo@example.com',
    password: 'local-password-value',
    reason: '',
  })
})
