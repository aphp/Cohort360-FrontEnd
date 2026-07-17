import { describe, expect, it, vi } from 'vitest'

vi.mock('services/aphp/serviceOnboarding', () => ({
  default: { updateStep: vi.fn(), signCharter: vi.fn() }
}))

import { getScreenConfig, getStepScreenCount, ONBOARDING_STEPS } from '../steps'

const COMMITMENTS_STEP = 1
const HANDSON_STEP = 2

const commitmentScreens = () => ONBOARDING_STEPS[COMMITMENTS_STEP].screens

describe('onboarding step 2 configuration', () => {
  it('exposes the seven informative screens then the charter and its confirmation', () => {
    expect(commitmentScreens().map((screen) => screen.key)).toEqual([
      'usage-rules',
      'usage-purposes',
      'minimal-data-use',
      'data-crossing',
      'data-deletion',
      'care-team-sharing',
      'actions-logging',
      'charter-signature',
      'charter-confirmation'
    ])
  })

  it('only the charter screen replaces the default primary button', () => {
    const withAction = commitmentScreens().filter((screen) => screen.primaryAction)
    expect(withAction).toHaveLength(1)
    expect(withAction[0].key).toBe('charter-signature')
    expect(withAction[0].primaryAction?.label).toBe('Signer')
  })

  it('renders the charter inside the default card wrapper', () => {
    expect(getScreenConfig(COMMITMENTS_STEP, 7)?.layout).toBeUndefined()
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
