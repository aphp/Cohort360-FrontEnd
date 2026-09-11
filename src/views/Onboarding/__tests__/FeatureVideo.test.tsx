import { render } from '@testing-library/react'
import React from 'react'
import { describe, expect, it } from 'vitest'

import FeatureVideo from '../FeatureVideo'

describe('FeatureVideo', () => {
  it('starts the tutorial at the requested chapter', () => {
    const { container } = render(<FeatureVideo startAt={314} label="Explorer les données" />)
    const player = container.querySelector('video')

    expect(player).toHaveAttribute(
      'src',
      'https://formaphp.fr/documents/orbisetmoi/Tutoriels_Video/Cohort360_v0.mp4#t=314'
    )
    expect(player).toHaveAttribute('aria-label', 'Explorer les données')
    expect(player).toHaveAttribute('controls')
    expect(player).toHaveAttribute('preload', 'metadata')
  })
})
