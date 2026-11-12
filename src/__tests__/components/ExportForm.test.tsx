import { describe, it, expect, vi, beforeEach } from 'vitest'
import { act, fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, useNavigate } from 'react-router'

const dispatch = vi.fn()
vi.mock('state', () => ({ useAppDispatch: () => dispatch }))
vi.mock('state/warningDialog', () => ({ showDialog: vi.fn((p) => ({ type: 'show', payload: p })) }))

const fetchExportableCohorts = vi.fn(async (..._a: any[]) => [])
const fetchExportableCohort = vi.fn(async (..._a: any[]) => [{ uuid: 'c1', group_id: 'g1', name: 'Cohorte' }])
vi.mock('services/aphp/callApi', () => ({
  fetchExportableCohorts: (...a: any[]) => fetchExportableCohorts(...a),
  fetchExportableCohort: (...a: any[]) => fetchExportableCohort(...a)
}))

const fetchExportTablesInfo = vi.fn(async (..._a: any[]) => [
  { name: 'person', columns: [], fhirResourceName: 'Patient', isFhirStandard: true, isOmopStandard: false }
])
const fetchExportPurposePrefill = vi.fn(async (..._a: any[]): Promise<any> => null)
const postExportCohort = vi.fn(async (..._a: any[]) => ({ status: 201, data: {} }))
vi.mock('services/aphp/serviceExportCohort', () => ({
  fetchExportTablesInfo: (...a: any[]) => fetchExportTablesInfo(...a),
  fetchExportTablesRelationsInfo: vi.fn(async () => []),
  fetchExportPurposePrefill: (...a: any[]) => fetchExportPurposePrefill(...a),
  postExportCohort: (...a: any[]) => postExportCohort(...a)
}))

vi.mock('pages/ExportRequest/components/exportUtils', () => ({
  sortTables: (t: unknown[]) => t
}))

// On isole ExportForm de son enfant ExportTable
vi.mock('../ExportTable', () => ({ default: () => <div data-testid="export-table" /> }))
vi.mock('pages/ExportRequest/components/ExportTable', () => ({ default: () => <div data-testid="export-table" /> }))

import ExportForm from 'pages/ExportRequest/components/ExportForm'

const renderForm = (initialEntry = '/export') =>
  render(
    <MemoryRouter initialEntries={[initialEntry]}>
      <ExportForm />
    </MemoryRouter>
  )

const flushPromises = () => act(async () => {})

beforeEach(() => {
  vi.clearAllMocks()
  fetchExportPurposePrefill.mockReset()
  fetchExportPurposePrefill.mockResolvedValue(null)
  fetchExportableCohorts.mockReset()
  fetchExportableCohorts.mockResolvedValue([])
})

describe('ExportForm', () => {
  it('charge la liste des cohortes exportables au montage (sans groupId)', async () => {
    renderForm('/export')
    await waitFor(() => {
      expect(fetchExportableCohorts).toHaveBeenCalled()
    })
  })

  it('charge la liste des tables d’export au montage', async () => {
    renderForm('/export')
    await waitFor(() => {
      expect(fetchExportTablesInfo).toHaveBeenCalled()
    })
  })

  it('vérifie l’existence de la cohorte quand groupId est présent', async () => {
    renderForm('/export?groupId=g1')
    await waitFor(() => {
      expect(fetchExportableCohort).toHaveBeenCalledWith('g1')
    })
  })

  it('gère une erreur de chargement des tables sans planter', async () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    fetchExportTablesInfo.mockRejectedValueOnce(new Error('boom'))
    renderForm('/export')
    await waitFor(() => {
      expect(errorSpy).toHaveBeenCalled()
    })
    errorSpy.mockRestore()
  })

  it('affiche un avertissement si la cohorte n’existe pas', async () => {
    fetchExportableCohort.mockResolvedValueOnce([])
    renderForm('/export?groupId=inexistant')
    await waitFor(() => {
      expect(dispatch).toHaveBeenCalled()
    })
  })
})

describe('ExportForm, finalité de l’export', () => {
  const cohort = { uuid: 'c1', group_id: 'g1', name: 'Cohorte' }

  const renderCohortForm = async () => {
    fetchExportableCohorts.mockResolvedValue([cohort] as never)
    renderForm('/export?groupId=g1')
    return await screen.findByRole('combobox', { name: /Finalité de l'export/ })
  }

  const choosePurpose = (purposeSelect: HTMLElement, label: string) => {
    fireEvent.mouseDown(purposeSelect)
    fireEvent.click(within(screen.getByRole('listbox')).getByRole('option', { name: new RegExp(`^${label}`) }))
  }

  const confirmButton = () => screen.getByRole('button', { name: 'Confirmer' })
  const acceptConditions = () => fireEvent.click(screen.getByRole('checkbox', { name: /Je reconnais avoir lu/ }))
  const dateInput = (label: RegExp) =>
    screen.getAllByLabelText(label).find((element) => element.tagName === 'INPUT') as HTMLInputElement
  const daySection = (index: number) => screen.getAllByRole('spinbutton', { name: 'Jour' })[index]
  const typeIn = (label: RegExp, value: string) => fireEvent.change(screen.getByLabelText(label), { target: { value } })

  it('remplace le motif par la finalité, sans valeur présélectionnée', async () => {
    const purposeSelect = await renderCohortForm()
    expect(screen.queryByLabelText(/Motif de l'export/)).not.toBeInTheDocument()
    expect(purposeSelect).not.toHaveTextContent(/Appui|Pilotage|Recherche/)

    fireEvent.mouseDown(purposeSelect)
    const options = within(screen.getByRole('listbox')).getAllByRole('option')
    expect(options).toHaveLength(4)
    expect(options[0]).toHaveTextContent(/Appui au soin.*prise en charge de patients/)
  })

  it('bloque l’export tant qu’aucune finalité n’est choisie', async () => {
    const purposeSelect = await renderCohortForm()
    acceptConditions()
    expect(confirmButton()).toBeDisabled()

    choosePurpose(purposeSelect, 'Appui au soin')
    expect(confirmButton()).toBeEnabled()
    expect(screen.queryByLabelText(/Porteur du projet/)).not.toBeInTheDocument()
  })

  it('demande titre et porteur en recherche interne, et les garde au changement de finalité', async () => {
    const purposeSelect = await renderCohortForm()
    acceptConditions()
    choosePurpose(purposeSelect, 'Recherche interne')

    expect(dateInput(/Date de début du projet/)).toBeInTheDocument()
    expect(dateInput(/Date de fin du projet/)).toBeInTheDocument()
    expect(confirmButton()).toBeDisabled()

    typeIn(/Titre du projet/, 'Projet X')
    typeIn(/Porteur du projet/, '   ')
    expect(confirmButton()).toBeDisabled()
    typeIn(/Porteur du projet/, 'Jeanne Martin')
    expect(confirmButton()).toBeEnabled()

    choosePurpose(purposeSelect, 'Recherche multicentrique')
    expect(screen.queryByLabelText(/Titre du projet/)).not.toBeInTheDocument()
    choosePurpose(purposeSelect, 'Recherche interne')
    expect(screen.getByLabelText(/Titre du projet/)).toHaveValue('Projet X')
    expect(screen.getByLabelText(/Porteur du projet/)).toHaveValue('Jeanne Martin')
  })

  it('envoie la finalité et le projet à l’export', async () => {
    const purposeSelect = await renderCohortForm()
    acceptConditions()
    choosePurpose(purposeSelect, 'Recherche interne')
    typeIn(/Titre du projet/, ' Projet X ')
    typeIn(/Porteur du projet/, 'Jeanne Martin')
    fireEvent.click(confirmButton())

    await waitFor(() => expect(postExportCohort).toHaveBeenCalled(), { timeout: 2000 })
    expect(postExportCohort).toHaveBeenCalledWith(
      expect.objectContaining({
        purpose: 'internal_research',
        projectDetails: { title: 'Projet X', project_leader: 'Jeanne Martin', start_date: null, end_date: null }
      })
    )
  })

  it('n’envoie pas le projet saisi quand une autre finalité est validée', async () => {
    const purposeSelect = await renderCohortForm()
    acceptConditions()
    choosePurpose(purposeSelect, 'Recherche interne')
    typeIn(/Titre du projet/, 'Projet X')
    typeIn(/Porteur du projet/, 'Jeanne Martin')
    choosePurpose(purposeSelect, "Pilotage de l'activité")
    fireEvent.click(confirmButton())

    await waitFor(() => expect(postExportCohort).toHaveBeenCalled(), { timeout: 2000 })
    expect(postExportCohort).toHaveBeenCalledWith(
      expect.objectContaining({ purpose: 'activity_management', projectDetails: null })
    )
  })

  it('ne bloque pas l’export après une date laissée incomplète puis un changement de finalité', async () => {
    const user = userEvent.setup()
    const purposeSelect = await renderCohortForm()
    acceptConditions()
    choosePurpose(purposeSelect, 'Recherche interne')
    typeIn(/Titre du projet/, 'Projet X')
    typeIn(/Porteur du projet/, 'Jeanne Martin')
    await user.click(daySection(0))
    await user.keyboard('0106')
    expect(confirmButton()).toBeDisabled()

    choosePurpose(purposeSelect, 'Appui au soin')
    choosePurpose(purposeSelect, 'Recherche interne')
    expect(confirmButton()).toBeEnabled()
  })

  it('garde les dates saisies au retour en recherche interne', async () => {
    const user = userEvent.setup()
    const purposeSelect = await renderCohortForm()
    choosePurpose(purposeSelect, 'Recherche interne')
    await user.click(daySection(0))
    await user.keyboard('01062026')

    choosePurpose(purposeSelect, 'Appui au soin')
    choosePurpose(purposeSelect, 'Recherche interne')
    expect(dateInput(/Date de début du projet/)).toHaveValue('01/06/2026')
  })

  it('ignore une finalité préremplie inconnue', async () => {
    fetchExportPurposePrefill.mockResolvedValueOnce({ purpose: 'autre', project_details: null })
    const purposeSelect = await renderCohortForm()
    acceptConditions()

    await waitFor(() => expect(fetchExportPurposePrefill).toHaveBeenCalled())
    await flushPromises()
    expect(confirmButton()).toBeDisabled()
    expect(purposeSelect).not.toHaveTextContent(/Appui|Pilotage|Recherche/)
  })

  it('garde la saisie faite pendant le chargement de la liste des cohortes', async () => {
    let resolveCohorts: (value: unknown) => void = () => {}
    fetchExportableCohorts.mockReturnValue(new Promise((resolve) => (resolveCohorts = resolve)) as never)
    renderForm('/export?groupId=g1')

    choosePurpose(await screen.findByRole('combobox', { name: /Finalité de l'export/ }), 'Recherche interne')
    typeIn(/Titre du projet/, 'Projet X')
    await act(async () => resolveCohorts([cohort]))

    await waitFor(() => expect(fetchExportPurposePrefill).toHaveBeenCalledWith('c1'))
    await flushPromises()
    expect(screen.getByLabelText(/Titre du projet/)).toHaveValue('Projet X')
  })

  it('préremplit la finalité et le projet du dernier export', async () => {
    fetchExportPurposePrefill.mockResolvedValueOnce({
      purpose: 'internal_research',
      project_details: { title: 'Projet X', project_leader: 'Jeanne Martin', start_date: '2026-06-01', end_date: null }
    })
    const purposeSelect = await renderCohortForm()

    expect(await screen.findByLabelText(/Titre du projet/)).toHaveValue('Projet X')
    expect(fetchExportPurposePrefill).toHaveBeenCalledWith('c1')
    expect(purposeSelect).toHaveTextContent('Recherche interne')
    expect(screen.getByLabelText(/Porteur du projet/)).toHaveValue('Jeanne Martin')
    expect(dateInput(/Date de début du projet/)).toHaveValue('01/06/2026')
  })

  it('n’écrase pas une finalité choisie avant la réponse du préremplissage', async () => {
    let resolvePrefill: (value: unknown) => void = () => {}
    fetchExportPurposePrefill.mockReturnValueOnce(new Promise((resolve) => (resolvePrefill = resolve)))
    const purposeSelect = await renderCohortForm()

    choosePurpose(purposeSelect, 'Appui au soin')
    resolvePrefill({ purpose: 'multicenter_research', project_details: null })

    await waitFor(() => expect(fetchExportPurposePrefill).toHaveBeenCalled())
    await flushPromises()
    expect(purposeSelect).toHaveTextContent('Appui au soin')
  })
})

describe('ExportForm, changement de cohorte', () => {
  const cohortA = { uuid: 'ca', group_id: 'ga', name: 'Cohorte A' }
  const cohortB = { uuid: 'cb', group_id: 'gb', name: 'Cohorte B' }

  const BackToCohortChoice = () => {
    const navigate = useNavigate()
    return <button onClick={() => navigate('/export')}>retour</button>
  }

  const renderWithBack = () =>
    render(
      <MemoryRouter initialEntries={['/export']}>
        <BackToCohortChoice />
        <ExportForm />
      </MemoryRouter>
    )

  const choosePurpose = (purposeSelect: HTMLElement, label: string) => {
    fireEvent.mouseDown(purposeSelect)
    fireEvent.click(within(screen.getByRole('listbox')).getByRole('option', { name: new RegExp(`^${label}`) }))
  }

  const chooseCohort = async (name: string) => {
    fireEvent.mouseDown(await screen.findByRole('combobox', { name: 'Sélectionner une cohorte' }))
    fireEvent.click(await screen.findByRole('option', { name }))
  }

  it('repart d’une saisie vide pour une cohorte sans export de référence', async () => {
    fetchExportableCohorts.mockResolvedValue([cohortA, cohortB] as never)
    fetchExportPurposePrefill.mockImplementation(async (uuid: string) =>
      uuid === 'ca'
        ? {
            purpose: 'internal_research',
            project_details: { title: 'Projet A', project_leader: 'Jeanne Martin', start_date: null, end_date: null }
          }
        : null
    )
    renderWithBack()

    await chooseCohort('Cohorte A')
    expect(await screen.findByLabelText(/Titre du projet/)).toHaveValue('Projet A')

    fireEvent.click(screen.getByText('retour'))
    await chooseCohort('Cohorte B')

    await waitFor(() => expect(fetchExportPurposePrefill).toHaveBeenCalledWith('cb'))
    await flushPromises()
    expect(screen.queryByLabelText(/Titre du projet/)).not.toBeInTheDocument()
    const purposeSelect = screen.getByRole('combobox', { name: /Finalité de l'export/ })
    expect(purposeSelect).not.toHaveTextContent(/Recherche/)

    choosePurpose(purposeSelect, 'Recherche interne')
    expect(screen.getByLabelText(/Titre du projet/)).toHaveValue('')
  })

  it('oublie une date incomplète de la cohorte précédente', async () => {
    const user = userEvent.setup()
    fetchExportableCohorts.mockResolvedValue([cohortA, cohortB] as never)
    renderWithBack()

    await chooseCohort('Cohorte A')
    choosePurpose(await screen.findByRole('combobox', { name: /Finalité de l'export/ }), 'Recherche interne')
    await user.click(screen.getAllByRole('spinbutton', { name: 'Jour' })[0])
    await user.keyboard('0106')

    fireEvent.click(screen.getByText('retour'))
    await chooseCohort('Cohorte B')
    await waitFor(() => expect(fetchExportPurposePrefill).toHaveBeenCalledWith('cb'))
    await flushPromises()

    choosePurpose(screen.getByRole('combobox', { name: /Finalité de l'export/ }), 'Recherche interne')
    fireEvent.change(screen.getByLabelText(/Titre du projet/), { target: { value: 'Projet B' } })
    fireEvent.change(screen.getByLabelText(/Porteur du projet/), { target: { value: 'Jeanne Martin' } })
    fireEvent.click(screen.getByRole('checkbox', { name: /Je reconnais avoir lu/ }))
    expect(screen.getByRole('button', { name: 'Confirmer' })).toBeEnabled()
  })

  it('applique le préremplissage de la nouvelle cohorte même après une saisie sur la précédente', async () => {
    fetchExportableCohorts.mockResolvedValue([cohortA, cohortB] as never)
    fetchExportPurposePrefill.mockImplementation(async (uuid: string) =>
      uuid === 'cb' ? { purpose: 'multicenter_research', project_details: null } : null
    )
    renderWithBack()

    await chooseCohort('Cohorte A')
    choosePurpose(await screen.findByRole('combobox', { name: /Finalité de l'export/ }), 'Appui au soin')

    fireEvent.click(screen.getByText('retour'))
    await chooseCohort('Cohorte B')

    await waitFor(() =>
      expect(screen.getByRole('combobox', { name: /Finalité de l'export/ })).toHaveTextContent('Recherche multicentrique')
    )
  })
})
