import { render } from '@testing-library/react'
import React from 'react'
import { describe, expect, it } from 'vitest'

import FeatureVideo from '../FeatureVideo'

describe('FeatureVideo', () => {
  it('pairs the mp4 with its poster and waits for the user before downloading it', () => {
    const { container } = render(<FeatureVideo name="demo_cohort_360" label="Démonstration de Cohort360" />)
    const video = container.querySelector('video')

    expect(video).toHaveAttribute('poster', '/assets/videos/demo_cohort_360_poster.jpg')
    expect(video).toHaveAttribute('preload', 'none')
    expect(video).toHaveAttribute('controls')
    expect(video).toHaveAttribute('aria-label', 'Démonstration de Cohort360')
    expect(container.querySelector('video source')).toHaveAttribute('src', '/assets/videos/demo_cohort_360.mp4')
  })
})
