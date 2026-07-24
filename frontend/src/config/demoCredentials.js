export function resolveDemoCredentials(env = {}) {
  const enabled = env.VITE_ENABLE_DEMO_CREDENTIAL_AUTOFILL === 'true'
  const email = String(env.VITE_DEMO_EMAIL || '').trim()
  const password = String(env.VITE_DEMO_PASSWORD || '')

  if (!enabled) {
    return { available: false, email: '', password: '', reason: 'Demo credential autofill is disabled.' }
  }
  if (!email || !password) {
    return { available: false, email: '', password: '', reason: 'Configured demo credentials are incomplete.' }
  }

  return { available: true, email, password, reason: '' }
}

export const demoCredentials = resolveDemoCredentials(import.meta.env)
