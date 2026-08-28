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

  it('states the retention period and the purposes of the logs', () => {
    render(<ActionsLogging />)
    expect(screen.getByText(/conservées pendant 3 ans/)).toBeInTheDocument()
    expect(screen.getByText(/demandes d'audit de la CNIL/)).toBeInTheDocument()
    expect(screen.getByText(/accéder à vos données et les rectifier/)).toBeInTheDocument()
  })

  it('reads the address from the runtime configuration', () => {
    updateConfig({ system: { mailDataProtection: 'dpo@example.org' } })
    render(<ActionsLogging />)
    expect(screen.getByRole('link', { name: 'dpo@example.org' })).toHaveAttribute('href', 'mailto:dpo@example.org')
    updateConfig({ system: { mailDataProtection: 'protection.donnees.dsi@aphp.fr' } })
  })
})
