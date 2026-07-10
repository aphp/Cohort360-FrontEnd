import { render, screen } from '@testing-library/react'
import { updateConfig } from 'config'
import React from 'react'
import { describe, expect, it } from 'vitest'

import ActionsLogging from '../ActionsLogging'

describe('ActionsLogging (RG3308.03)', () => {
  it('exposes the data protection address as a clickable mailto link', () => {
    render(<ActionsLogging />)
    const link = screen.getByRole('link', { name: 'protection.donnees.dsi@aphp.fr' })
    expect(link).toHaveAttribute('href', 'mailto:protection.donnees.dsi@aphp.fr')
  })

  it('describes its illustration to assistive technologies', () => {
    render(<ActionsLogging />)
    expect(screen.getByRole('img', { name: 'Vos actions sont enregistrées et conservées' })).toBeInTheDocument()
  })

  it('reads the address from the runtime configuration', () => {
    updateConfig({ system: { mailDataProtection: 'dpo@example.org' } })
    render(<ActionsLogging />)
    expect(screen.getByRole('link', { name: 'dpo@example.org' })).toHaveAttribute('href', 'mailto:dpo@example.org')
    updateConfig({ system: { mailDataProtection: 'protection.donnees.dsi@aphp.fr' } })
  })
})
