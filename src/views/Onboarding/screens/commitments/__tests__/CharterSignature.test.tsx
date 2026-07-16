import { render, screen } from '@testing-library/react'
import React from 'react'
import { describe, expect, it } from 'vitest'

import CharterSignature from '../CharterSignature'

const CHARTER_PDF_URL = '/documents/charte-engagement-cohort360.pdf'

describe('CharterSignature (RG3309.01)', () => {
  it('embeds the charter as a scrollable PDF document', () => {
    render(<CharterSignature />)
    const document = screen.getByLabelText("Charte d'engagement Cohort360")
    expect(document).toHaveAttribute('data', `${CHARTER_PDF_URL}#navpanes=0&toolbar=0&statusbar=0&view=FitH`)
    expect(document).toHaveAttribute('type', 'application/pdf')
  })

  it('offers a fallback link for browsers that cannot render the PDF inline', () => {
    render(<CharterSignature />)
    expect(screen.getByRole('link', { name: "Ouvrir la charte d'engagement" })).toHaveAttribute('href', CHARTER_PDF_URL)
  })
})
