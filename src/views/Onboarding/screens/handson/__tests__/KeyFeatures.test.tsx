import { configureStore } from '@reduxjs/toolkit'
import { render, screen, waitFor } from '@testing-library/react'
import React from 'react'
import { Provider } from 'react-redux'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const getMyAccesses = vi.fn()
const getRightsCatalog = vi.fn()

vi.mock('services/aphp/serviceOnboarding', () => ({
  default: { getMyAccesses: () => getMyAccesses(), getRightsCatalog: () => getRightsCatalog() }
}))

import meReducer, { type MeState } from 'state/me'
import type { MyAccess } from 'types'
import KeyFeatures from '../KeyFeatures'

const TUTORIAL_URL = 'https://formaphp.fr/documents/orbisetmoi/Tutoriels_Video/Cohort360_v0.mp4'

const videoSources = (container: HTMLElement) =>
  Array.from(container.querySelectorAll('video')).map((player) => player.getAttribute('src'))

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

const EXPORT_DENIED = /Votre habilitation ne vous permet pas/

const accessWithExport = (granted: boolean): MyAccess => ({
  id: 1,
  role: { name: 'Profil', right_export_csv_xlsx_nominative: granted },
  perimeter: null,
  end_datetime: null
})

beforeEach(() => {
  getMyAccesses.mockReset()
  getRightsCatalog.mockReset()
  getMyAccesses.mockResolvedValue([accessWithExport(true)])
  getRightsCatalog.mockResolvedValue([])
})

describe('KeyFeatures (US-3310)', () => {
  it('shows the three feature videos to a nominative access (RG3310.01)', () => {
    const { container } = renderKeyFeatures(nominative)
    expect(videoSources(container)).toEqual([`${TUTORIAL_URL}#t=1`, `${TUTORIAL_URL}#t=314`, `${TUTORIAL_URL}#t=618`])
    expect(screen.getByText(/Comment exporter des données \?/)).toBeInTheDocument()
  })

  it('drops the export video for a pseudonymised access (RG3310.02)', () => {
    const { container } = renderKeyFeatures(pseudonymised)
    expect(videoSources(container)).toEqual([`${TUTORIAL_URL}#t=1`, `${TUTORIAL_URL}#t=314`])
    expect(screen.queryByText(/Comment exporter des données \?/)).not.toBeInTheDocument()
  })

  it('drops the export video when the access is unknown', () => {
    const { container } = renderKeyFeatures(null)
    expect(videoSources(container)).toHaveLength(2)
    expect(screen.queryByText(/Comment exporter des données \?/)).not.toBeInTheDocument()
  })

  it('warns a nominative access without the CSV/Excel export right', async () => {
    getMyAccesses.mockResolvedValue([accessWithExport(false)])
    renderKeyFeatures(nominative)
    expect(await screen.findByText(EXPORT_DENIED)).toBeInTheDocument()
  })

  it('does not warn when a role grants the CSV/Excel export right', async () => {
    renderKeyFeatures(nominative)
    await waitFor(() => expect(getMyAccesses).toHaveBeenCalled())
    expect(screen.queryByText(EXPORT_DENIED)).not.toBeInTheDocument()
  })
})
