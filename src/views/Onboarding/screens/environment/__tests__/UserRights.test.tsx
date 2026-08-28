import { configureStore } from '@reduxjs/toolkit'
import { render, screen } from '@testing-library/react'
import React from 'react'
import { Provider } from 'react-redux'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const getMyAccesses = vi.fn()
const getRightsCatalog = vi.fn()

vi.mock('services/aphp/serviceOnboarding', () => ({
  default: { getMyAccesses: () => getMyAccesses(), getRightsCatalog: () => getRightsCatalog() }
}))

import meReducer, { type MeState } from 'state/me'
import type { MyAccess, RightCatalogCategory } from 'types'
import UserRights from '../UserRights'

const CATALOG: RightCatalogCategory[] = [
  {
    name: 'Lecture de données patient',
    is_global: false,
    rights: [
      { name: 'right_read_patient_nominative', label: 'Lecture de données patient nominatives', depends_on: null },
      { name: 'right_read_patient_pseudonymized', label: 'Lecture de données patient pseudonymisées', depends_on: null }
    ]
  },
  {
    name: 'Recherche de patients',
    is_global: true,
    rights: [{ name: 'right_search_patients_by_ipp', label: 'Chercher les patients par IPP', depends_on: null }]
  },
  {
    name: 'Logs',
    is_global: true,
    rights: [{ name: 'right_read_logs', label: 'Consulter les logs', depends_on: null }]
  }
]

const access = (overrides: Partial<MyAccess> = {}): MyAccess => ({
  id: 1,
  role: {
    name: 'ADMIN CENTRAL',
    right_read_patient_nominative: true,
    right_read_patient_pseudonymized: true,
    right_search_patients_by_ipp: true,
    right_read_logs: false
  },
  perimeter: { source_value: '072', name: 'HOPITAL ROTHSCHILD' },
  end_datetime: '2027-04-20T00:00:00Z',
  ...overrides
})

const baseMe = { displayName: 'Cesar RICHARD', userName: '4286397' } as MeState

const renderUserRights = (me: MeState = baseMe) => {
  const store = configureStore({ reducer: { me: meReducer }, preloadedState: { me } })
  return render(
    <Provider store={store}>
      <UserRights />
    </Provider>
  )
}

describe('UserRights (US-3307)', () => {
  beforeEach(() => {
    getMyAccesses.mockReset()
    getRightsCatalog.mockReset()
    getMyAccesses.mockResolvedValue([access()])
    getRightsCatalog.mockResolvedValue(CATALOG)
  })

  it('shows the user, habilitation name as profile, granted rights (catalog labels), perimeter and expiration', async () => {
    renderUserRights()
    expect(await screen.findByText('ADMIN CENTRAL')).toBeInTheDocument()
    expect(screen.getByText('Cesar RICHARD')).toBeInTheDocument()
    expect(screen.getByText('Lecture de données patient nominatives')).toBeInTheDocument()
    expect(screen.getByText('Lecture de données patient pseudonymisées')).toBeInTheDocument()
    expect(screen.getByText('Chercher les patients par IPP')).toBeInTheDocument()
    expect(screen.getByText('072 - HOPITAL ROTHSCHILD')).toBeInTheDocument()
    expect(screen.getByText('20/04/2027')).toBeInTheDocument()
  })

  it('carries the APH of the user next to his name, inside the tile', async () => {
    renderUserRights()
    await screen.findByText('ADMIN CENTRAL')
    expect(screen.getByText("APH de l'utilisateur :")).toBeInTheDocument()
    expect(screen.getByText('4286397')).toBeInTheDocument()
  })

  it('puts the habilitation title in the singular, then in the plural', async () => {
    const { unmount } = renderUserRights()
    expect(await screen.findByRole('heading')).toHaveTextContent('Comprendre votre habilitation')
    unmount()

    getMyAccesses.mockResolvedValue([access(), access({ id: 2 })])
    renderUserRights()
    expect(await screen.findByRole('heading')).toHaveTextContent('Comprendre vos habilitations')
  })

  it('lists only granted rights (a non-granted right is not shown)', async () => {
    renderUserRights()
    await screen.findByText('ADMIN CENTRAL')
    expect(screen.queryByText('Consulter les logs')).not.toBeInTheDocument()
  })

  it('renders one tile per access (RG3307.03)', async () => {
    getMyAccesses.mockResolvedValue([
      access(),
      access({
        id: 2,
        role: { name: 'droit faible pour test', right_read_patient_pseudonymized: true },
        perimeter: { source_value: 'UPS', name: 'AP-HP.UNIVERSITE PARIS SACLAY' },
        end_datetime: '2026-08-07T00:00:00Z'
      })
    ])
    renderUserRights()

    expect(await screen.findByText('ADMIN CENTRAL')).toBeInTheDocument()
    expect(screen.getByText('droit faible pour test')).toBeInTheDocument()
    expect(screen.getByText('UPS - AP-HP.UNIVERSITE PARIS SACLAY')).toBeInTheDocument()
    expect(screen.getByText('07/08/2026')).toBeInTheDocument()

    const tiles = screen.getByText('ADMIN CENTRAL').parentElement?.parentElement as HTMLElement
    expect(getComputedStyle(tiles).flexDirection).toBe('column')
  })

  it('falls back gracefully when no expiration date is available', async () => {
    getMyAccesses.mockResolvedValue([access({ end_datetime: null })])
    renderUserRights()
    expect(await screen.findByText('Non renseignée')).toBeInTheDocument()
  })

  it('tells the user his access details are unavailable when a call fails (RG3381.01)', async () => {
    getRightsCatalog.mockRejectedValue(new Error('boom'))
    renderUserRights()
    expect(await screen.findByRole('status')).toHaveTextContent(
      /Le détail de votre accès à Cohort360 n'est pas disponible/
    )
  })

  it('titles the fallback screen after the access, not the habilitation', async () => {
    getMyAccesses.mockResolvedValue([])
    renderUserRights()
    await screen.findByRole('status')
    expect(screen.getByRole('heading')).toHaveTextContent('Comprendre votre accès')
  })

  it('points to the support without blocking the journey (RG3381.02)', async () => {
    getMyAccesses.mockRejectedValue(new Error('boom'))
    renderUserRights()
    await screen.findByRole('status')
    expect(screen.getByRole('link', { name: 'id.recherche.support.dsn@aphp.fr' })).toHaveAttribute(
      'href',
      'mailto:id.recherche.support.dsn@aphp.fr'
    )
  })

  it('shows the same message when the API answers without any access', async () => {
    getMyAccesses.mockResolvedValue([])
    renderUserRights()
    expect(await screen.findByRole('status')).toHaveTextContent(
      /Le détail de votre accès à Cohort360 n'est pas disponible/
    )
  })
})
