import { render } from '@testing-library/react'
import React from 'react'
import { describe, expect, it } from 'vitest'

import FeatureVideo from '../FeatureVideo'

describe('FeatureVideo', () => {
  it('embeds the tutorial from the cookieless domain and waits for the section to be reached', () => {
    const { container } = render(<FeatureVideo videoId="-UjXIK4Svb4" label="Créer une cohorte grâce au requêteur" />)
    const frame = container.querySelector('iframe')

    expect(frame).toHaveAttribute('src', 'https://www.youtube-nocookie.com/embed/-UjXIK4Svb4')
    expect(frame).toHaveAttribute('title', 'Créer une cohorte grâce au requêteur')
    expect(frame).toHaveAttribute('loading', 'lazy')
    expect(frame).toHaveAttribute('allowfullscreen')
  })
})
