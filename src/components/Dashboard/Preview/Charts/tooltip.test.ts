import * as d3 from 'd3'
import { describe, it, expect, beforeEach } from 'vitest'
import { formatValueWithShare, hideTooltip, showTooltip } from './tooltip'

describe('formatValueWithShare', () => {
  it('returns the value and its share of the total', () => {
    expect(formatValueWithShare(1, 3)).toBe('1 (33.33%)')
    expect(formatValueWithShare(4, 4)).toBe('4 (100%)')
  })

  it('returns 0% instead of NaN% when the total is 0', () => {
    expect(formatValueWithShare(0, 0)).toBe('0 (0%)')
  })
})

describe('showTooltip / hideTooltip', () => {
  beforeEach(() => {
    document.body.innerHTML = '<div id="tooltip"></div><svg><rect id="bar"></rect></svg>'
  })

  it('fills and positions the tooltip on hover', () => {
    const tooltip = d3.select('#tooltip')
    const bar = document.getElementById('bar')
    showTooltip(bar, tooltip, { pageX: 100, pageY: 50 } as MouseEvent, 2, 8)

    const node = document.getElementById('tooltip') as HTMLElement
    expect(node.innerHTML).toBe('2 (25%)')
    expect(node.style.left).toBe('110px')
    expect(node.style.top).toBe('35px')
  })

  it('does not throw when hiding the tooltip', () => {
    const tooltip = d3.select('#tooltip')
    expect(() => hideTooltip(document.getElementById('bar'), tooltip)).not.toThrow()
  })
})
