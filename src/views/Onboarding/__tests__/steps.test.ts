import { describe, expect, it, vi } from 'vitest'

vi.mock('services/aphp/serviceOnboarding', () => ({
  default: { updateStep: vi.fn(), signCharter: vi.fn() }
}))

import { COMMITMENTS } from '../commitments'
import { COMMITMENT_PRIMARY_LABEL, getScreenConfig, getStepScreenCount, ONBOARDING_STEPS } from '../steps'

const COMMITMENTS_STEP = 1
const HANDSON_STEP = 2
const SUMMARY_SUBSTEP = 11

const commitmentScreens = () => ONBOARDING_STEPS[COMMITMENTS_STEP].screens

describe('onboarding step 2 configuration', () => {
  it('opens on the rules then walks the ten commitments before the summary', () => {
    expect(commitmentScreens().map((screen) => screen.key)).toEqual([
      'usage-rules',
      'personal-access',
      'perimeter-scope',
      'usage-purposes',
      'data-crossing',
      'medical-secrecy',
      'data-protection',
      'incident-reporting',
      'habilitation-lifecycle',
      'data-deletion',
      'actions-logging',
      'commitments-summary'
    ])
  })

  it('tags each commitment screen in order (RG3429.02)', () => {
    const tags = commitmentScreens()
      .map((screen) => screen.tag)
      .filter(Boolean)
    expect(tags).toEqual(COMMITMENTS.map((_, index) => `Engagement ${index + 1}`))
  })

  it('labels the ten commitment buttons `Je m’y engage` (RG3429.04)', () => {
    const commitments = commitmentScreens().filter((screen) => screen.tag)
    expect(commitments).toHaveLength(10)
    for (const screen of commitments) {
      expect(screen.primaryAction?.label).toBe(COMMITMENT_PRIMARY_LABEL)
      expect(screen.primaryAction?.run).toBeUndefined()
    }
  })

  it('only the summary screen records the validation (RG3429.07)', () => {
    const summary = getScreenConfig(COMMITMENTS_STEP, SUMMARY_SUBSTEP)
    expect(summary?.key).toBe('commitments-summary')
    expect(summary?.primaryAction?.label).toBe('Valider')
    expect(summary?.primaryAction?.run).toBeDefined()
  })

  it('holds the summary button until the certification is ticked (RG3429.08)', () => {
    expect(getScreenConfig(COMMITMENTS_STEP, SUMMARY_SUBSTEP)?.requiresAcknowledgement).toBe(true)
  })

  it('renders the summary inside the default card wrapper', () => {
    expect(getScreenConfig(COMMITMENTS_STEP, SUMMARY_SUBSTEP)?.layout).toBeUndefined()
  })

  it('counts a screenless step as a single slot so the journey never stalls', () => {
    expect(getStepScreenCount(99)).toBe(1)
  })
})

describe('onboarding step 3 configuration', () => {
  it('gathers the guided tour on a single screen', () => {
    expect(ONBOARDING_STEPS[HANDSON_STEP].screens.map((screen) => screen.key)).toEqual(['key-features'])
  })

  it('closes the journey with a button to the application, without any action of its own', () => {
    const primaryAction = getScreenConfig(HANDSON_STEP, 0)?.primaryAction
    expect(primaryAction?.label).toBe('Accéder à Cohort360')
    expect(primaryAction?.run).toBeUndefined()
  })
})
