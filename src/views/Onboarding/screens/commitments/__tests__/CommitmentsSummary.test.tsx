import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import React from 'react'
import { describe, expect, it } from 'vitest'

import { COMMITMENTS } from '../../../commitments'
import { OnboardingProvider } from '../../../OnboardingContext'
import CommitmentsSummary from '../CommitmentsSummary'

const renderSummary = (mode?: 'journey' | 'review') => {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(
    <QueryClientProvider client={queryClient}>
      <OnboardingProvider initialStep={1} mode={mode}>
        <CommitmentsSummary />
      </OnboardingProvider>
    </QueryClientProvider>
  )
}

describe('CommitmentsSummary (RG3429.05)', () => {
  it('lists the ten commitments', () => {
    renderSummary()
    for (const commitment of COMMITMENTS) {
      expect(screen.getByText(commitment)).toBeInTheDocument()
    }
    expect(COMMITMENTS).toHaveLength(10)
  })

  it('shortens the eighth commitment, as the mockups do', () => {
    renderSummary()
    expect(screen.getByText('Vous anticipez la modification ou la clôture de vos accès')).toBeInTheDocument()
    expect(screen.queryByText(/clôture de vos habilitations/)).not.toBeInTheDocument()
  })

  it('offers the commitments recap as a downloadable document', () => {
    renderSummary()

    const link = screen.getByRole('link', { name: 'Télécharger un récapitulatif de vos engagements' })
    expect(link).toHaveAttribute('href', '/documents/synthese-engagements-cohort360.pdf')
    expect(link).toHaveAttribute('download')
  })

  it('exposes the mandatory certification, unchecked at first (RG3429.07)', async () => {
    const user = userEvent.setup()
    renderSummary()

    const consent = screen.getByRole('checkbox', { name: /Je certifie avoir pris connaissance/ })
    expect(consent).not.toBeChecked()

    await user.click(consent)
    expect(consent).toBeChecked()
  })

  it('shows the certification ticked and locked when the journey is replayed', async () => {
    // A disabled checkbox ignores pointer events: the click is forced to prove it changes nothing.
    const user = userEvent.setup({ pointerEventsCheck: 0 })
    renderSummary('review')

    const consent = screen.getByRole('checkbox', { name: /Je certifie avoir pris connaissance/ })
    expect(consent).toBeChecked()
    expect(consent).toBeDisabled()

    await user.click(consent)
    expect(consent).toBeChecked()
  })
})
