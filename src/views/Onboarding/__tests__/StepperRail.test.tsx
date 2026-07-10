import { render, screen } from '@testing-library/react'
import React from 'react'
import { describe, expect, it } from 'vitest'

import StepperRail from '../StepperRail'

const steps = [
  { key: 'a', label: 'Step A' },
  { key: 'b', label: 'Step B' },
  { key: 'c', label: 'Step C' }
]

/** One segment per step except the last; each holds the filled part as its only child. */
const segmentFills = (container: HTMLElement) =>
  Array.from(container.querySelectorAll('[aria-hidden] > span')).map((node) => (node as HTMLElement).style.height)

describe('StepperRail', () => {
  it('renders a label per step', () => {
    render(<StepperRail steps={steps} activeStep={0} />)
    expect(screen.getByText('Step A')).toBeInTheDocument()
    expect(screen.getByText('Step B')).toBeInTheDocument()
    expect(screen.getByText('Step C')).toBeInTheDocument()
  })

  it('numbers the current and upcoming steps', () => {
    render(<StepperRail steps={steps} activeStep={1} />)
    expect(screen.getByText('2')).toBeInTheDocument()
    expect(screen.getByText('3')).toBeInTheDocument()
  })

  it('replaces the number of a completed step with a check mark', () => {
    render(<StepperRail steps={steps} activeStep={1} />)
    expect(screen.queryByText('1')).not.toBeInTheDocument()
    expect(screen.getByTitle('Étape terminée')).toBeInTheDocument()
  })

  it('marks only the active step for assistive technologies', () => {
    render(<StepperRail steps={steps} activeStep={1} />)
    expect(screen.getByText('Step B')).toHaveAttribute('aria-current', 'step')
    expect(screen.getByText('Step C')).not.toHaveAttribute('aria-current')
  })

  it('centres each label on its circle rather than on the whole item', () => {
    const { container } = render(<StepperRail steps={steps} activeStep={1} />)
    const head = screen.getByText('Step B').parentElement as HTMLElement
    expect(getComputedStyle(head).alignItems).toBe('center')
    // The segment hangs below the head, so it never stretches the row the label sits in.
    expect(head.querySelector('[aria-hidden]')).toBeNull()
    expect(container.querySelectorAll('[aria-hidden]')).toHaveLength(steps.length - 1)
  })

  it('draws one segment fewer than there are steps', () => {
    const { container } = render(<StepperRail steps={steps} activeStep={0} />)
    expect(segmentFills(container)).toHaveLength(steps.length - 1)
  })

  it('fills the segments of the steps already left behind', () => {
    const { container } = render(<StepperRail steps={steps} activeStep={1} stepProgress={0} />)
    expect(segmentFills(container)).toEqual(['100%', '0%'])
  })

  it('advances the segment below the active step as its screens are visited', () => {
    const { container } = render(<StepperRail steps={steps} activeStep={1} stepProgress={0.25} />)
    expect(segmentFills(container)).toEqual(['100%', '25%'])
  })

  it('clamps an out-of-range progress', () => {
    const { container } = render(<StepperRail steps={steps} activeStep={0} stepProgress={1.8} />)
    expect(segmentFills(container)[0]).toBe('100%')
  })

  it('leaves every segment empty on the welcome screen', () => {
    const { container } = render(<StepperRail steps={steps} activeStep={-1} />)
    expect(segmentFills(container)).toEqual(['0%', '0%'])
    expect(screen.getByText('1')).toBeInTheDocument()
    expect(screen.queryByTitle('Étape terminée')).not.toBeInTheDocument()
  })
})
