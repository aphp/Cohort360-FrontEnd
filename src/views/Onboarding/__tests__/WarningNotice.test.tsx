import { render, screen } from '@testing-library/react'
import React from 'react'
import { describe, expect, it } from 'vitest'

import { onboardingTokens } from '../tokens'
import WarningNotice, { WARNING_NOTICE_TEXT } from '../WarningNotice'

const filledCircle = (container: HTMLElement) =>
  Array.from(container.querySelectorAll('span')).find(
    (node) => getComputedStyle(node).borderRadius === '50%' && getComputedStyle(node).backgroundColor !== ''
  )

describe('WarningNotice', () => {
  it('states the responsibility message', () => {
    render(<WarningNotice />)
    expect(screen.getByText(WARNING_NOTICE_TEXT)).toBeInTheDocument()
    expect(screen.getByTestId('onboarding-warning')).toBeInTheDocument()
  })

  it('wraps its icon in a filled circle', () => {
    const { container } = render(<WarningNotice />)
    const circle = filledCircle(container)
    expect(circle).toBeDefined()
    expect(getComputedStyle(circle as HTMLElement).backgroundColor).toBe('rgb(229, 0, 125)')
    expect(onboardingTokens.warning).toBe('#E5007D')
  })
})
