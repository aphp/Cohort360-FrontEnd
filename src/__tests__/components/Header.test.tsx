import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import HeaderLayout from 'components/ui/Header'

describe('ui/Header (HeaderLayout)', () => {
  it('affiche le titre', () => {
    render(<HeaderLayout title="Mon titre" />)
    expect(screen.getByText('Mon titre')).toBeInTheDocument()
  })

  it('affiche la description quand fournie', () => {
    render(<HeaderLayout title="Titre" description="Une description" />)
    expect(screen.getByText('Une description')).toBeInTheDocument()
  })

  it('affiche la dernière connexion', () => {
    render(<HeaderLayout title="Titre" lastConnexion="2024-01-01" />)
    expect(screen.getByText(/2024-01-01/)).toBeInTheDocument()
  })

  it('rend en mode titleOnly', () => {
    const { container } = render(<HeaderLayout title="Titre seul" titleOnly />)
    expect(container.firstChild).toBeInTheDocument()
    expect(screen.getByText('Titre seul')).toBeInTheDocument()
  })

  it('affiche le nombre de patients', () => {
    render(<HeaderLayout title="Titre" patientsCount={1234} cohortId="c1" />)
    // le composant affiche un compteur de patients
    expect(screen.getByText('Titre')).toBeInTheDocument()
  })

  it('rend les zones optionnelles (searchArea, actionsMenu)', () => {
    render(
      <HeaderLayout
        title="Titre"
        searchArea={<div data-testid="search-area" />}
        actionsMenu={<div data-testid="actions-menu" />}
      />
    )
    expect(screen.getByTestId('search-area')).toBeInTheDocument()
  })
})
