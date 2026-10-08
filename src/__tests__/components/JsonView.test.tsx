import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'

vi.mock('state', () => ({
  useAppDispatch: () => vi.fn(),
  useAppSelector: (selector: (s: unknown) => unknown) => selector({ cohortCreation: { request: { json: '' } } })
}))
vi.mock('state/cohortCreation', () => ({ editJson: vi.fn() }))
vi.mock('components/CreationCohort/DiagramView/components/JsonView/monacoSetup', () => ({}))
vi.mock('monaco-editor/esm/vs/language/json/monaco.contribution', () => ({}))
vi.mock('@monaco-editor/react', () => ({
  default: ({ onChange }: { onChange: (value: string) => void }) => (
    <textarea data-testid="json-editor" onChange={(e) => onChange(e.target.value)} />
  )
}))
// le schéma n'est pas l'objet du test : on accepte toute requête syntaxiquement valide
vi.mock('utils/avjSchema/serializedQuerySchema.json', () => ({ default: {} }))

import JsonView from 'components/CreationCohort/DiagramView/components/JsonView'

const query = (filterFhir: string) =>
  JSON.stringify({
    _type: 'request',
    request: {
      _type: 'andGroup',
      criteria: [{ _type: 'basicResource', _id: 1, resourceType: 'Observation', filterFhir }]
    }
  })

const onJsonIssuesChange = vi.fn()

beforeEach(() => {
  vi.clearAllMocks()
})

describe('JsonView', () => {
  it('signale un paramètre encounter.* sur un critère de Biologie et bloque l’exécution', async () => {
    render(<JsonView onJsonIssuesChange={onJsonIssuesChange} debounceMs={0} />)
    fireEvent.change(screen.getByTestId('json-editor'), {
      target: { value: query('code=A&encounter.status=finished') }
    })

    expect(await screen.findByText('Critère non disponible')).toBeInTheDocument()
    expect(
      screen.getByText(
        "Le paramètre encounter.status n'est plus disponible pour la Biologie : les analyses ne sont plus rattachées à une visite. Retirez-le du critère pour exécuter la requête."
      )
    ).toBeInTheDocument()
    expect(screen.queryByText('JSON valide')).not.toBeInTheDocument()
    expect(onJsonIssuesChange).toHaveBeenLastCalledWith(true)
  })

  it('autorise l’exécution une fois le paramètre retiré', async () => {
    render(<JsonView onJsonIssuesChange={onJsonIssuesChange} debounceMs={0} />)
    const editor = screen.getByTestId('json-editor')
    fireEvent.change(editor, { target: { value: query('code=A&encounter.status=finished') } })
    await screen.findByText('Critère non disponible')

    fireEvent.change(editor, { target: { value: query('code=A') } })
    expect(await screen.findByText('JSON valide')).toBeInTheDocument()
    expect(screen.queryByText('Critère non disponible')).not.toBeInTheDocument()
    await waitFor(() => expect(onJsonIssuesChange).toHaveBeenLastCalledWith(false))
  })
})
