import { render, screen } from '@testing-library/react'
import React from 'react'
import { describe, expect, it } from 'vitest'

import CircleBadge from 'components/ui/CircleBadge'
import InfoBadge from 'components/ui/InfoBadge'

const circleOf = (container: HTMLElement) => container.querySelector('span') as HTMLElement

describe('CircleBadge', () => {
  it('fills the disc with the given colour in the filled variant', () => {
    const { container } = render(
      <CircleBadge color="#E5007D" variant="filled">
        <span>x</span>
      </CircleBadge>
    )
    const style = getComputedStyle(circleOf(container))
    expect(style.backgroundColor).toBe('rgb(229, 0, 125)')
    expect(style.borderRadius).toBe('50%')
  })

  it('draws a ring instead of a disc in the outlined variant', () => {
    const { container } = render(
      <CircleBadge color="#E5007D" variant="outlined">
        <span>x</span>
      </CircleBadge>
    )
    const style = getComputedStyle(circleOf(container))
    expect(style.backgroundColor).toBe('rgba(0, 0, 0, 0)')
    expect(style.borderColor).toBe('rgb(229, 0, 125)')
  })

  it('scales its border and font with the requested size', () => {
    const { container } = render(
      <CircleBadge color="#000000" size={40}>
        <span>x</span>
      </CircleBadge>
    )
    const style = getComputedStyle(circleOf(container))
    expect(style.width).toBe('40px')
    expect(style.borderWidth).toBe('8px')
    expect(style.fontSize).toBe('20px')
  })
})

describe('InfoBadge', () => {
  it('still renders the italic "i" glyph after being rebuilt on CircleBadge', () => {
    render(<InfoBadge />)
    expect(screen.getByText('i')).toBeInTheDocument()
  })

  it('forwards its size to the badge', () => {
    const { container } = render(<InfoBadge size={32} />)
    expect(getComputedStyle(circleOf(container)).width).toBe('32px')
  })
})
