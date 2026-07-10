import { describe, expect, it, vi } from 'vitest'

vi.mock('services/aphp/serviceOnboarding', () => ({
  default: { updateStep: vi.fn(), signCharter: vi.fn() }
}))

import { getScreenConfig, getStepScreenCount, ONBOARDING_STEPS } from '../steps'

const COMMITMENTS_STEP = 1

const commitmentScreens = () => ONBOARDING_STEPS[COMMITMENTS_STEP].screens

describe('onboarding step 2 configuration', () => {
  it('exposes the seven informative screens then the charter and its confirmation', () => {
    expect(commitmentScreens().map((screen) => screen.key)).toEqual([
      'usage-rules',
      'actions-logging',
      'care-team-sharing',
      'data-crossing',
      'minimal-data-use',
      'usage-purposes',
      'data-deletion',
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

  it('renders the charter without the card wrapper', () => {
    expect(getScreenConfig(COMMITMENTS_STEP, 7)?.layout).toBe('bare')
  })

  it('counts a screenless step as a single slot so the journey never stalls', () => {
    expect(ONBOARDING_STEPS[2].screens).toHaveLength(0)
    expect(getStepScreenCount(2)).toBe(1)
  })
})
