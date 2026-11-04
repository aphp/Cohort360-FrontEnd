import React from 'react'
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import Chart from 'components/ui/Chart'

describe('Chart', () => {
  it('affiche le graphique quand il y a des données', () => {
    render(<Chart title="Titre">graphique</Chart>)
    expect(screen.getByText('graphique')).toBeInTheDocument()
    expect(screen.queryByText('Aucune donnée à afficher')).not.toBeInTheDocument()
  })

  it('affiche un message à la place du graphique quand il est vide', () => {
    render(
      <Chart title="Titre" isEmpty>
        graphique
      </Chart>
    )
    expect(screen.getByText('Aucune donnée à afficher')).toBeInTheDocument()
    expect(screen.queryByText('graphique')).not.toBeInTheDocument()
  })

  it('affiche le chargement plutôt que le message pendant le chargement', () => {
    render(
      <Chart title="Titre" isEmpty isLoading>
        graphique
      </Chart>
    )
    expect(screen.getByRole('progressbar')).toBeInTheDocument()
    expect(screen.queryByText('Aucune donnée à afficher')).not.toBeInTheDocument()
  })
})
