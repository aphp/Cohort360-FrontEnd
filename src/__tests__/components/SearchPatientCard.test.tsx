import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'

const navigate = vi.fn()
vi.mock('react-router', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router')>()
  return { ...actual, useNavigate: () => navigate }
})

let deidentified = false
vi.mock('state', () => ({
  useAppSelector: (selector: (s: unknown) => unknown) => selector({ me: { deidentified } })
}))

import SearchPatientCard from 'components/Welcome/SearchPatientCard/SearchPatientCard'

beforeEach(() => {
  vi.clearAllMocks()
  deidentified = false
})

describe('Welcome/SearchPatientCard', () => {
  it('affiche le titre', () => {
    render(<SearchPatientCard />)
    expect(screen.getByText('Chercher un patient')).toBeInTheDocument()
  })

  it('affiche le champ de recherche en mode nominatif', () => {
    render(<SearchPatientCard />)
    expect(screen.getByPlaceholderText(/Cherchez un ipp/)).toBeInTheDocument()
  })

  it('affiche l’accès verrouillé en mode pseudonymisé', () => {
    deidentified = true
    render(<SearchPatientCard />)
    expect(screen.queryByPlaceholderText(/Cherchez un ipp/)).not.toBeInTheDocument()
  })
})
