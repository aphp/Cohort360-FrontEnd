import { render, screen } from '@testing-library/react'
import React from 'react'
import { describe, expect, it } from 'vitest'

import StepperRail from '../StepperRail'

const steps = [
  { key: 'a', label: 'Step A' },
  { key: 'b', label: 'Step B' },
  { key: 'c', label: 'Step C' }
]

describe('StepperRail', () => {
  it('renders a label per step', () => {
    render(<StepperRail steps={steps} activeStep={0} />)
    expect(screen.getByText('Step A')).toBeInTheDocument()
    expect(screen.getByText('Step B')).toBeInTheDocument()
    expect(screen.getByText('Step C')).toBeInTheDocument()
  })

  it('renders every step number', () => {
    render(<StepperRail steps={steps} activeStep={1} />)
    expect(screen.getByText('1')).toBeInTheDocument()
    expect(screen.getByText('2')).toBeInTheDocument()
    expect(screen.getByText('3')).toBeInTheDocument()
  })

  it('stays inactive when activeStep is -1', () => {
    render(<StepperRail steps={steps} activeStep={-1} />)
    expect(screen.getByText('Step A')).toBeInTheDocument()
  })
})
