import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import React from 'react'
import { describe, expect, it } from 'vitest'

import { OnboardingProvider } from '../../../OnboardingContext'
import CharterSignature from '../CharterSignature'

const CHARTER_PDF_URL = '/documents/charte-engagement-cohort360.pdf'

const renderCharter = () => {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(
    <QueryClientProvider client={queryClient}>
      <OnboardingProvider initialStep={1}>
        <CharterSignature />
      </OnboardingProvider>
    </QueryClientProvider>
  )
}

describe('CharterSignature (RG3309.01)', () => {
  it('embeds the charter as a scrollable PDF document', () => {
    renderCharter()
    const document = screen.getByLabelText("Charte d'engagement Cohort360")
    expect(document).toHaveAttribute('data', `${CHARTER_PDF_URL}#navpanes=0&toolbar=0&statusbar=0&view=FitH`)
    expect(document).toHaveAttribute('type', 'application/pdf')
  })

  it('offers a fallback link for browsers that cannot render the PDF inline', () => {
    renderCharter()
    expect(screen.getByRole('link', { name: "Ouvrir la charte d'engagement" })).toHaveAttribute('href', CHARTER_PDF_URL)
  })

  it('exposes the mandatory consent, unchecked at first', async () => {
    const user = userEvent.setup()
    renderCharter()

    const consent = screen.getByRole('checkbox', { name: /Je certifie avoir pris connaissance/ })
    expect(consent).not.toBeChecked()

    await user.click(consent)
    expect(consent).toBeChecked()
  })
})
