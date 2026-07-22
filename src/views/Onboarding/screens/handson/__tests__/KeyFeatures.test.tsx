import { configureStore } from '@reduxjs/toolkit'
import { render, screen } from '@testing-library/react'
import React from 'react'
import { Provider } from 'react-redux'
import { describe, expect, it } from 'vitest'

import meReducer, { type MeState } from 'state/me'
import KeyFeatures from '../KeyFeatures'

const videoSources = (container: HTMLElement) =>
  Array.from(container.querySelectorAll('video source')).map((source) => source.getAttribute('src'))

const renderKeyFeatures = (me: MeState) => {
  const store = configureStore({ reducer: { me: meReducer }, preloadedState: { me } })
  return render(
    <Provider store={store}>
      <KeyFeatures />
    </Provider>
  )
}

const nominative = { displayName: 'Cesar RICHARD', deidentified: false } as MeState
const pseudonymised = { displayName: 'Cesar RICHARD', deidentified: true } as MeState

describe('KeyFeatures (US-3310)', () => {
  it('shows the three feature videos to a nominative access (RG3310.01)', () => {
    const { container } = renderKeyFeatures(nominative)
    expect(videoSources(container)).toEqual([
      '/assets/videos/constitution_cohorte.mp4',
      '/assets/videos/parcours_patient.mp4',
      '/assets/videos/export_dataset.mp4'
    ])
    expect(screen.getByText(/Exporter des données/)).toBeInTheDocument()
  })

  it('drops the export video for a pseudonymised access (RG3310.02)', () => {
    const { container } = renderKeyFeatures(pseudonymised)
    expect(videoSources(container)).toEqual([
      '/assets/videos/constitution_cohorte.mp4',
      '/assets/videos/parcours_patient.mp4'
    ])
    expect(screen.queryByText(/Exporter des données/)).not.toBeInTheDocument()
  })

  it('drops the export video when the access is unknown', () => {
    const { container } = renderKeyFeatures(null)
    expect(videoSources(container)).toHaveLength(2)
    expect(screen.queryByText(/Exporter des données/)).not.toBeInTheDocument()
  })
})
