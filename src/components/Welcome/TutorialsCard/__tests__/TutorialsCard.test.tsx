import { render } from '@testing-library/react'
import React from 'react'
import { describe, expect, it } from 'vitest'

import { TUTORIAL_VIDEOS } from 'views/Onboarding/tutorials'
import TutorialsCard from '../TutorialsCard'

describe('TutorialsCard', () => {
  it('shows only the export tutorial on the home page (RG3543.02)', () => {
    const { container } = render(<TutorialsCard />)
    const players = container.querySelectorAll('video')

    expect(players).toHaveLength(1)
    expect(players[0]).toHaveAttribute('src', TUTORIAL_VIDEOS.export)
    expect(players[0]).toHaveAttribute('aria-label', 'Exporter des données')
    expect(container.querySelector('iframe')).not.toBeInTheDocument()
  })
})
