import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import { vi, describe, it, expect, beforeEach } from 'vitest'
import { DocumentReference } from 'fhir/r4'

// Mocks
vi.mock('services/aphp', () => ({
  default: {
    cohorts: {
      fetchDocumentContent: vi.fn()
    }
  }
}))

vi.mock('config', () => ({
  getConfig: () => ({
    system: {
      fhirUrl: 'http://fhir.example.com'
    }
  })
}))

vi.mock('services/apiFhir', () => ({
  getAuthorizationMethod: () => 'Bearer'
}))

vi.mock('react-pdf', () => ({
  pdfjs: {
    GlobalWorkerOptions: { workerSrc: '' },
    version: '3.0.0'
  },
  Document: ({ children }: { children: React.ReactNode }) => <div data-testid="pdf-document">{children}</div>,
  Page: () => <div data-testid="pdf-page" />
}))

vi.mock('assets/images/watermark_pseudo.svg?react', () => ({
  default: () => <svg data-testid="watermark" />
}))

vi.mock('html-react-parser', () => ({
  default: (html: string) => html
}))

import DocumentViewer from 'components/DocumentViewer/DocumentViewer'
import services from 'services/aphp'

const mockFetchDocumentContent = vi.mocked(services.cohorts.fetchDocumentContent)

const buildDocumentReference = (contentTypes: string[]): DocumentReference => ({
  resourceType: 'DocumentReference',
  status: 'current',
  content: contentTypes.map((contentType) => ({
    attachment: {
      contentType,
      data:
        contentType === 'text/plain'
          ? Buffer.from('<p>Contenu texte du document</p>').toString('base64')
          : undefined
    }
  }))
})

const defaultProps = {
  open: true,
  handleClose: vi.fn(),
  documentId: 'doc-123',
  deidentified: false
}

describe('DocumentViewer - hasPdfContent', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("devrait afficher l'onglet PDF quand le document contient un contenu PDF et que l'utilisateur n'est pas déidentifié", async () => {
    mockFetchDocumentContent.mockResolvedValue(
      buildDocumentReference(['application/pdf', 'text/plain'])
    )

    render(<DocumentViewer {...defaultProps} />)

    await waitFor(() => {
      expect(screen.getByRole('tab', { name: 'PDF' })).toBeInTheDocument()
    })
  })

  it("ne devrait pas afficher l'onglet PDF quand le document ne contient pas de contenu PDF", async () => {
    mockFetchDocumentContent.mockResolvedValue(buildDocumentReference(['text/plain']))

    render(<DocumentViewer {...defaultProps} />)

    await waitFor(() => {
      expect(screen.queryByRole('tab', { name: 'PDF' })).not.toBeInTheDocument()
    })
  })

  it("ne devrait pas afficher l'onglet PDF quand l'utilisateur est déidentifié, même si le document contient un PDF", async () => {
    mockFetchDocumentContent.mockResolvedValue(
      buildDocumentReference(['application/pdf', 'text/plain'])
    )

    render(<DocumentViewer {...defaultProps} deidentified={true} />)

    await waitFor(() => {
      expect(screen.queryByRole('tab', { name: 'PDF' })).not.toBeInTheDocument()
    })
  })

  it("devrait afficher l'onglet 'Texte brut pseudonymisé' dans tous les cas", async () => {
    mockFetchDocumentContent.mockResolvedValue(buildDocumentReference(['text/plain']))

    render(<DocumentViewer {...defaultProps} />)

    await waitFor(() => {
      expect(screen.getByRole('tab', { name: 'Texte brut pseudonymisé' })).toBeInTheDocument()
    })
  })

  it("devrait basculer vers l'onglet 'raw' si l'onglet PDF est sélectionné mais que le document ne contient pas de PDF", async () => {
    // D'abord, on simule un document avec PDF (pour que l'onglet PDF soit visible)
    mockFetchDocumentContent.mockResolvedValue(
      buildDocumentReference(['application/pdf', 'text/plain'])
    )

    const { rerender } = render(<DocumentViewer {...defaultProps} documentId="doc-with-pdf" />)

    await waitFor(() => {
      expect(screen.getByRole('tab', { name: 'PDF' })).toBeInTheDocument()
    })

    // Ensuite, on change le documentId vers un document sans PDF
    mockFetchDocumentContent.mockResolvedValue(buildDocumentReference(['text/plain']))

    rerender(<DocumentViewer {...defaultProps} documentId="doc-without-pdf" />)

    await waitFor(() => {
      expect(screen.queryByRole('tab', { name: 'PDF' })).not.toBeInTheDocument()
    })
  })

  it("ne devrait pas afficher le contenu PDF quand hasPdfContent est false", async () => {
    mockFetchDocumentContent.mockResolvedValue(buildDocumentReference(['text/plain']))

    render(<DocumentViewer {...defaultProps} />)

    await waitFor(() => {
      expect(screen.queryByTestId('pdf-document')).not.toBeInTheDocument()
    })
  })
})
