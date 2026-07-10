import type { Plugin } from 'vite'

/**
 * Serves the onboarding endpoints in dev while the back-end carrying them is not deployed yet.
 * Enabled with `VITE_DEV_MOCK_ONBOARDING=true`; never mounted in a production build.
 *
 * Mounted before the `/api/back` proxy so these two routes never reach the real back-end.
 * Progress lives in memory: restarting the dev server resets the journey.
 */
const ONBOARDING_TOTAL_STEPS = 3

const STEP_ROUTE = '/api/back/users/me/onboarding/'
const CHARTER_ROUTE = '/api/back/users/me/onboarding/charter/'

const isEnabled = (envVal: string | undefined) => envVal?.trim().toLowerCase() === 'true'

const readJsonBody = (req: NodeJS.ReadableStream): Promise<Record<string, unknown>> =>
  new Promise((resolve) => {
    let raw = ''
    req.on('data', (chunk) => {
      raw += chunk
    })
    req.on('end', () => {
      try {
        resolve(raw ? JSON.parse(raw) : {})
      } catch {
        resolve({})
      }
    })
  })

export function devOnboardingMock(env: Record<string, string | undefined>): Plugin[] {
  if (!isEnabled(env.VITE_DEV_MOCK_ONBOARDING)) {
    return []
  }

  const state = { step: 0, completedAt: null as string | null, charterSignedAt: null as string | null }

  return [
    {
      name: 'cohort360:dev-onboarding-mock',
      apply: 'serve',
      configureServer(server) {
        console.info('[cohort360] mock onboarding actif (VITE_DEV_MOCK_ONBOARDING) : back non appelé sur ces routes')

        server.middlewares.use(async (req, res, next) => {
          const url = req.url?.split('?')[0]

          const reply = (body: unknown) => {
            res.setHeader('Content-Type', 'application/json')
            res.statusCode = 200
            res.end(JSON.stringify(body))
          }

          if (url === CHARTER_ROUTE && req.method === 'POST') {
            state.charterSignedAt ??= new Date().toISOString()
            return reply({ charter_signed_at: state.charterSignedAt })
          }

          if (url === STEP_ROUTE && req.method === 'PATCH') {
            const body = await readJsonBody(req)
            const step = Number(body.onboarding_step)
            if (!Number.isInteger(step) || step < state.step || step > state.step + 1) {
              res.statusCode = 400
              res.setHeader('Content-Type', 'application/json')
              return res.end(JSON.stringify({ onboarding_step: ['invalid step transition'] }))
            }
            state.step = step
            if (step >= ONBOARDING_TOTAL_STEPS) {
              state.completedAt ??= new Date().toISOString()
            }
            return reply({ onboarding_step: state.step, onboarding_completed_at: state.completedAt })
          }

          return next()
        })
      }
    }
  ]
}
