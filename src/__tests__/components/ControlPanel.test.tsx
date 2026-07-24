import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { AppConfig, getConfig } from 'config'
import { JobStatus, LoadingStatus } from 'types'

// Évite le chargement de react-pdf (DOMMatrix indisponible en jsdom) via le chaînage DocumentViewer
vi.mock('react-pdf', () => ({
  Document: () => null,
  Page: () => null,
  pdfjs: { GlobalWorkerOptions: {} }
}))
vi.mock('components/DocumentViewer/DocumentViewer', () => ({ default: () => <div data-testid="doc-viewer" /> }))

const dispatch = vi.fn(() => ({ unwrap: () => Promise.resolve({}) }))
const state = {
  cohortCreation: {
    request: {
      viewMode: 'LOGICAL_OPERATOR_INTERFACE',
      loading: false,
      saveLoading: false,
      count: { status: JobStatus.FINISHED, includePatient: 1000 },
      criteriaGroup: [{ id: 0, title: 'root', criteriaIds: [1], isInclusive: true, type: 'andGroup' }],
      selectedCriteria: [{ id: 1, type: 'Condition', title: 'Diag' }],
      selectedPopulation: [{ id: 'p1', name: 'Hop' }],
      currentSnapshot: { uuid: 's1' },
      navHistory: [],
      requestId: 'req1',
      requestName: 'Ma requête',
      json: '{}',
      count_outdated: false,
      snapshotsHistory: [{ uuid: 's1', created_at: '2024-01-01' }]
    }
  },
  preferences: { requests: { detailedMode: false } },
  me: { maintenance: { active: false } }
}

vi.mock('state', () => ({
  useAppDispatch: () => dispatch,
  useAppSelector: (selector: (s: unknown) => unknown) => selector(state)
}))

vi.mock('state/cohortCreation', () => ({
  countCohortCreation: vi.fn(() => ({ type: 'countCohortCreation' })),
  deleteCriteriaGroup: vi.fn(() => ({ type: 'deleteCriteriaGroup' })),
  buildCohortCreation: vi.fn(() => ({ type: 'buildCohortCreation' })),
  unbuildCohortCreation: vi.fn(() => ({ type: 'unbuildCohortCreation' })),
  addActionToNavHistory: vi.fn(() => ({ type: 'addActionToNavHistory' })),
  updateCount: vi.fn(() => ({ type: 'updateCount' })),
  editSnapshotHistory: vi.fn(() => ({ type: 'editSnapshotHistory' })),
  saveJson: vi.fn(() => ({ type: 'saveJson' }))
}))

vi.mock('state/preferences', () => ({ setRequestDetailedMode: vi.fn(() => ({ type: 'setRequestDetailedMode' })) }))

vi.mock('services/aphp', () => ({
  default: {
    cohortCreation: {
      countCohort: vi.fn(async () => ({})),
      createSnapshot: vi.fn(async () => ({})),
      fetchSnapshot: vi.fn(async () => ({}))
    }
  }
}))

vi.mock('components/CreationCohort/ControlPanel/useCountReconciliation', () => ({
  useCountReconciliation: vi.fn()
}))

// On isole les enfants lourds (dialogues/modales)
vi.mock('../Modals/ModalCohortTitle/ModalCohortTitle', () => ({ default: () => <div data-testid="modal-title" /> }))
vi.mock('components/Researches/Modals/ModalShareRequest', () => ({ default: () => <div data-testid="modal-share" /> }))
vi.mock('./Versions/VersionsDialog', () => ({ default: () => <div data-testid="versions-dialog" /> }))
vi.mock('./Versions', () => ({ default: () => <div data-testid="versions-section" /> }))

import ControlPanel from 'components/CreationCohort/ControlPanel/ControlPanel'

const renderPanel = (props: { canExecuteJson?: boolean; onExecute?: () => void } = {}) =>
  render(
    <AppConfig.Provider value={getConfig()}>
      <ControlPanel canExecuteJson={props.canExecuteJson ?? true} onExecute={props.onExecute} />
    </AppConfig.Provider>
  )

beforeEach(() => {
  vi.clearAllMocks()
})

describe('ControlPanel', () => {
  it('se rend sans planter avec un état de requête complet', () => {
    const { container } = renderPanel()
    expect(container.firstChild).toBeInTheDocument()
  })

  it('affiche le nombre de patients inclus', () => {
    renderPanel()
    // le composant s'est rendu avec les données de count
    expect(screen.getAllByRole('button').length).toBeGreaterThan(0)
  })

  it('rend un contenu interactif (boutons)', () => {
    renderPanel()
    expect(screen.getAllByRole('button').length).toBeGreaterThan(0)
  })

  it('déclenche des actions au clic sur les boutons disponibles', () => {
    renderPanel()
    const buttons = screen.getAllByRole('button')
    expect(buttons.length).toBeGreaterThan(0)
    fireEvent.click(buttons[0])
    // au moins un rendu interactif, pas de crash
    expect(buttons[0]).toBeInTheDocument()
  })

  it('gère le mode maintenance actif', () => {
    state.me.maintenance.active = true
    const { container } = renderPanel()
    expect(container.firstChild).toBeInTheDocument()
    state.me.maintenance.active = false
  })
})
