import { render, screen } from '@testing-library/react'
import React from 'react'
import { describe, expect, it } from 'vitest'

import WarningNotice, { WARNING_NOTICE_TEXT } from '../WarningNotice'
import { onboardingTokens } from '../tokens'

const filledCircle = (container: HTMLElement) =>
  Array.from(container.querySelectorAll('span')).find(
    (node) => getComputedStyle(node).borderRadius === '50%' && getComputedStyle(node).backgroundColor !== ''
  )

describe('WarningNotice', () => {
  it('states the responsibility message in both variants', () => {
    render(<WarningNotice variant="inline" />)
    expect(screen.getByText(WARNING_NOTICE_TEXT)).toBeInTheDocument()
  })

  it('wraps the icon in a filled circle when displayed inside the card', () => {
    const { container } = render(<WarningNotice variant="inline" />)
    const circle = filledCircle(container)
    expect(circle).toBeDefined()
    expect(getComputedStyle(circle as HTMLElement).backgroundColor).toBe('rgb(229, 0, 125)')
    expect(onboardingTokens.warning).toBe('#E5007D')
  })

  it('shows the bare icon when displayed as a banner above the card', () => {
    const { container } = render(<WarningNotice variant="boxed" />)
    expect(filledCircle(container)).toBeUndefined()
    expect(screen.getByTestId('onboarding-warning-banner')).toBeInTheDocument()
  })
})
