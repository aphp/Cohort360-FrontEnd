import { render, screen } from '@testing-library/react'
import React from 'react'
import { describe, expect, it } from 'vitest'

import { getCommitmentTag } from '../commitments'
import ScreenTag from '../ScreenTag'

describe('ScreenTag (RG3429.02)', () => {
  it('renders the label it is given', () => {
    render(<ScreenTag label="Engagement 3" />)
    expect(screen.getByText('Engagement 3')).toBeInTheDocument()
  })

  it('numbers the commitments from one', () => {
    expect(getCommitmentTag(0)).toBe('Engagement 1')
    expect(getCommitmentTag(9)).toBe('Engagement 10')
  })
})
