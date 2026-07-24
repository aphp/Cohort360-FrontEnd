import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'

const listStaticContents = vi.fn(async (..._a: any[]) => [
  { title: 'Version 3.1', content: '## Nouveautés\n- Point 1' },
  { title: 'Version 3.0', content: 'Contenu' }
])
vi.mock('services/aphp/callApi', () => ({
  listStaticContents: (...a: any[]) => listStaticContents(...a)
}))

vi.mock('react-markdown', () => ({ default: ({ children }: { children?: unknown }) => <span>{children as never}</span> }))

import NewsCard from 'components/Welcome/NewsCard/NewsCard'

beforeEach(() => {
  vi.clearAllMocks()
})

describe('Welcome/NewsCard', () => {
  it('affiche le titre Actualités', () => {
    render(<NewsCard />)
    expect(screen.getByText('Actualités')).toBeInTheDocument()
  })

  it('récupère les notes de version au montage', async () => {
    render(<NewsCard />)
    await waitFor(() => {
      expect(listStaticContents).toHaveBeenCalledWith(['RELEASE_NOTE'])
    })
  })

  it('affiche les actualités récupérées', async () => {
    render(<NewsCard />)
    await waitFor(() => {
      expect(screen.getByText('Version 3.1')).toBeInTheDocument()
      expect(screen.getByText('Version 3.0')).toBeInTheDocument()
    })
  })

  it('gère l’absence d’actualités', async () => {
    listStaticContents.mockResolvedValueOnce([])
    render(<NewsCard />)
    await waitFor(() => {
      expect(screen.getByText('Actualités')).toBeInTheDocument()
    })
  })
})
