import { render, screen } from '@testing-library/react'
import React from 'react'
import { describe, expect, it } from 'vitest'

import WizardShell from '../WizardShell'

const steps = [
  { key: 'a', label: 'Step A' },
  { key: 'b', label: 'Step B' }
]

describe('WizardShell', () => {
  it('renders header, content, footer and the stepper', () => {
    render(
      <WizardShell header={<div>my header</div>} steps={steps} activeStep={0} footer={<button>next</button>}>
        <div>card body</div>
      </WizardShell>
    )
    expect(screen.getByText('my header')).toBeInTheDocument()
    expect(screen.getByText('card body')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'next' })).toBeInTheDocument()
    expect(screen.getByText('Step A')).toBeInTheDocument()
  })

  it('omits header and footer when not provided', () => {
    render(
      <WizardShell steps={steps} activeStep={-1}>
        <div>only body</div>
      </WizardShell>
    )
    expect(screen.getByText('only body')).toBeInTheDocument()
  })
})
