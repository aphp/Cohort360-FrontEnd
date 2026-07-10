import { render, screen } from '@testing-library/react'
import React from 'react'
import { describe, expect, it } from 'vitest'

import CharterConfirmation from '../CharterConfirmation'
import DataCrossing from '../DataCrossing'
import MinimalDataUse from '../MinimalDataUse'
import UsagePurposes from '../UsagePurposes'
import UsageRules from '../UsageRules'

describe('UsageRules', () => {
  it('introduces the commitments and carries the warning inside the card', () => {
    render(<UsageRules />)
    expect(screen.getByRole('heading')).toHaveTextContent("Les règles d'utilisation des données dans Cohort360")
    expect(screen.getByTestId('onboarding-warning-inline')).toBeInTheDocument()
  })
})

describe('DataCrossing', () => {
  it('states that cross-referencing with other databases is forbidden', () => {
    render(<DataCrossing />)
    expect(screen.getByRole('heading')).toHaveTextContent('Le croisement des données')
    expect(screen.getByText(/formellement interdit/)).toBeInTheDocument()
    expect(screen.getByRole('img')).toHaveAccessibleName(/croisement entre deux jeux de données est interdit/)
  })
})

describe('MinimalDataUse', () => {
  it('states that only strictly necessary data may be used', () => {
    render(<MinimalDataUse />)
    expect(screen.getByRole('heading')).toHaveTextContent("L'utilisation minimale des données")
    expect(screen.getByText(/strictement nécessaires à votre recherche/)).toBeInTheDocument()
    expect(screen.getByRole('img')).toBeInTheDocument()
  })
})

describe('UsagePurposes', () => {
  it('lists the three authorised purposes and nothing else', () => {
    render(<UsagePurposes />)
    expect(screen.getByRole('heading')).toHaveTextContent("Les finalités d'usage")
    expect(screen.getByText('Innovation')).toBeInTheDocument()
    expect(screen.getByText('Recherche')).toBeInTheDocument()
    expect(screen.getByText("Pilotage de l'activité hospitalière")).toBeInTheDocument()
    expect(screen.getByText(/Seules certaines finalités/)).toBeInTheDocument()
  })
})

describe('CharterConfirmation', () => {
  it('confirms the signature and points to the help centre', () => {
    render(<CharterConfirmation />)
    expect(screen.getByRole('heading')).toHaveTextContent("Votre charte d'engagement a bien été signée.")
    expect(screen.getByText(/centre d'aide de Cohort360/)).toBeInTheDocument()
  })
})
