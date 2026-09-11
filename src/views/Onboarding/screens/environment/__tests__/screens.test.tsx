import { render, screen } from '@testing-library/react'
import React from 'react'
import { describe, expect, it } from 'vitest'

import DataAccess from '../DataAccess'
import WhatIsCohort360 from '../WhatIsCohort360'

describe('WhatIsCohort360', () => {
  it('presents the tool', () => {
    render(<WhatIsCohort360 />)
    expect(screen.getByRole('heading')).toHaveTextContent("Qu'est-ce que Cohort360 ?")
    expect(
      screen.getByText(/outil de datavisualisation visant à constituer des cohortes de patients/)
    ).toBeInTheDocument()
  })

  it('links to the EDS site in a new tab, safely', () => {
    render(<WhatIsCohort360 />)
    const link = screen.getByRole('link', { name: /Entrepôt de Données de Santé/ })
    expect(link).toHaveAttribute('href', 'https://panorama.eds.aphp.fr/explorer-les-donnees')
    expect(link).toHaveAttribute('target', '_blank')
    expect(link).toHaveAttribute('rel', expect.stringContaining('noopener'))
  })

  it('lists the five families of data available in the warehouse', () => {
    render(<WhatIsCohort360 />)
    for (const family of [
      'Socio-démographie des patients',
      'Médico-administratif',
      'Médicaments',
      "Résultats d'examen",
      'Documents médicaux'
    ]) {
      expect(screen.getByText(family)).toBeInTheDocument()
    }
  })

  it('warns that the profile decides between nominative and pseudonymised data', () => {
    render(<WhatIsCohort360 />)
    expect(screen.getByText(/nominatives \(identité des patients visible\)/)).toBeInTheDocument()
  })
})

describe('DataAccess', () => {
  it('explains both the general case and multicentric research', () => {
    render(<DataAccess />)
    expect(screen.getByRole('heading')).toHaveTextContent("L'accès aux données de l'EDS")
    expect(screen.getByText(/Cas général :/)).toBeInTheDocument()
    expect(screen.getByText(/Recherche multicentrique :/)).toBeInTheDocument()
  })

  it('breathes 24 under the title but only 8 between two paragraphs', () => {
    const { container } = render(<DataAccess />)
    const paragraphs = container.querySelectorAll('p')
    expect(getComputedStyle(paragraphs[0]).marginTop).toBe('24px')
    expect(getComputedStyle(paragraphs[1]).marginTop).toBe('8px')
  })
})
