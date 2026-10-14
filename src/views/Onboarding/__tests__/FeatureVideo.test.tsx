import { render } from '@testing-library/react'
import React from 'react'
import { describe, expect, it } from 'vitest'

import FeatureVideo from '../FeatureVideo'
import { TUTORIAL_VIDEOS } from '../tutorials'

describe('FeatureVideo', () => {
  it('plays the requested tutorial from the start', () => {
    const { container } = render(<FeatureVideo src={TUTORIAL_VIDEOS.exploration} label="Explorer les données" />)
    const player = container.querySelector('video')

    expect(player).toHaveAttribute('src', TUTORIAL_VIDEOS.exploration)
    expect(player).toHaveAttribute('aria-label', 'Explorer les données')
    expect(player).toHaveAttribute('controls')
    expect(player).toHaveAttribute('preload', 'metadata')
  })
})
