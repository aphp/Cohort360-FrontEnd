import { render, screen } from '@testing-library/react'
import React from 'react'
import { describe, expect, it } from 'vitest'

import DataCrossing from '../DataCrossing'
import DataDeletion from '../DataDeletion'
import MedicalSecrecy from '../MedicalSecrecy'
import PerimeterScope from '../PerimeterScope'
import PersonalAccess from '../PersonalAccess'
import UsagePurposes from '../UsagePurposes'
import UsageRules from '../UsageRules'

describe('UsageRules', () => {
  it('introduces the commitments and is the only screen carrying the warning', () => {
    render(<UsageRules />)
    expect(screen.getByRole('heading')).toHaveTextContent("Les règles d'utilisation des données dans Cohort360")
    expect(screen.getByTestId('onboarding-warning')).toBeInTheDocument()
  })

  it('lists the texts the rules comply with', () => {
    render(<UsageRules />)
    expect(screen.getByText(/règles d'accès à l'EDS de l'AP-HP à des fins de recherche/)).toBeInTheDocument()
    expect(screen.getByText(/loi n° 78-17 du 6 janvier 1978/)).toBeInTheDocument()
  })
})

describe('PersonalAccess', () => {
  it('states that credentials are never shared, with an example (RG3429.03)', () => {
    render(<PersonalAccess />)
    expect(screen.getByRole('heading')).toHaveTextContent('Vos accès sont personnels')
    expect(screen.getByText(/pour vous seul/)).toBeInTheDocument()
    expect(screen.getByRole('note')).toHaveTextContent(/ne peut pas utiliser votre compte/)
  })
})

describe('PerimeterScope', () => {
  it('limits access to the granted perimeter', () => {
    render(<PerimeterScope />)
    expect(screen.getByRole('heading')).toHaveTextContent("Vous n'accédez qu'aux données de votre périmètre")
    expect(screen.getByText(/illégitime et sanctionnable/)).toBeInTheDocument()
    expect(screen.getByRole('img')).toBeInTheDocument()
  })
})

describe('UsagePurposes', () => {
  it('restricts the data to the purposes of the mission', () => {
    render(<UsagePurposes />)
    expect(screen.getByRole('heading')).toHaveTextContent("Vous n'utilisez les données que pour les finalités prévues")
    expect(screen.getByRole('note')).toHaveTextContent(/dossier médical d'un proche/)
  })
})

describe('DataCrossing', () => {
  it('states that cross-referencing with other sources is forbidden', () => {
    render(<DataCrossing />)
    expect(screen.getByRole('heading')).toHaveTextContent('Vous ne croisez pas les données')
    expect(screen.getByRole('img')).toHaveAccessibleName(/croisement entre deux jeux de données est interdit/)
    expect(screen.getByRole('note')).toHaveTextContent(/SNDS/)
  })
})

describe('MedicalSecrecy', () => {
  it('restricts disclosure to duly authorised people', () => {
    render(<MedicalSecrecy />)
    expect(screen.getByRole('heading')).toHaveTextContent('Vous respectez le secret médical')
    expect(screen.getByRole('img')).toBeInTheDocument()
  })
})

describe('DataDeletion', () => {
  it('requires the data to be deleted without any copy left', () => {
    render(<DataDeletion />)
    expect(screen.getByRole('heading')).toHaveTextContent("Vous supprimez les données à l'issue de votre mission")
    expect(screen.getByText(/sans en conserver de copie/)).toBeInTheDocument()
    expect(screen.getByRole('img')).toBeInTheDocument()
  })
})
