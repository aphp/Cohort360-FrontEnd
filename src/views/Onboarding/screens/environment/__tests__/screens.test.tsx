import { render, screen } from '@testing-library/react'
import React from 'react'
import { describe, expect, it } from 'vitest'

import DataAccess from '../DataAccess'
import WhatIsCohort360 from '../WhatIsCohort360'
import WhatIsEds from '../WhatIsEds'

describe('WhatIsCohort360', () => {
  it('presents the tool', () => {
    render(<WhatIsCohort360 />)
    expect(screen.getByRole('heading')).toHaveTextContent("Qu'est-ce que Cohort360 ?")
    expect(screen.getByText(/créer et de visualiser les données de groupes de patients/)).toBeInTheDocument()
  })
})

describe('WhatIsEds', () => {
  it('links to the EDS site in a new tab, safely', () => {
    render(<WhatIsEds />)
    const link = screen.getByRole('link', { name: /En savoir plus sur l'EDS/ })
    expect(link).toHaveAttribute('href', 'https://eds.aphp.fr/')
    expect(link).toHaveAttribute('target', '_blank')
    expect(link).toHaveAttribute('rel', expect.stringContaining('noopener'))
  })

  it('lists the five families of data available in the warehouse', () => {
    render(<WhatIsEds />)
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
    render(<WhatIsEds />)
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
})
