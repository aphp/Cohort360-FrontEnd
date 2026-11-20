import React from 'react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react'

const addRequestUnwrap = vi.fn()
const addRequest = vi.fn()
const addProject = vi.fn()

vi.mock('react-router', () => ({ useNavigate: () => vi.fn() }))

vi.mock('state', () => ({
  useAppDispatch: () => (action: unknown) => action,
  useAppSelector: (selector: (state: unknown) => unknown) =>
    selector({
      request: { requestsList: [], selectedRequest: null },
      project: { projectsList: [], selectedProject: null }
    })
}))

vi.mock('state/project', () => ({
  fetchProjects: () => ({ unwrap: () => Promise.resolve({ projectsList: [] }) }),
  setSelectedProject: () => ({})
}))

vi.mock('state/request', () => ({
  fetchRequests: () => ({ unwrap: () => Promise.resolve({ count: 0 }) }),
  addRequest: (args: unknown) => {
    addRequest(args)
    return { unwrap: addRequestUnwrap }
  }
}))

vi.mock('state/cohortCreation', () => ({ fetchRequestCohortCreation: () => ({}) }))

vi.mock('services/aphp', () => ({ default: { projects: { addProject: (...args: unknown[]) => addProject(...args) } } }))

import ModalCreateNewRequest from 'components/CreationCohort/Modals/ModalCreateNewRequest/ModalCreateNewRequest'

const createButton = () => screen.getByRole('button', { name: 'Créer' })

const selectNewProject = async () => {
  fireEvent.mouseDown(screen.getByRole('combobox'))
  fireEvent.click(within(await screen.findByRole('listbox')).getByText('Nouveau projet'))
}

describe('ModalCreateNewRequest — utilisateur sans projet', () => {
  beforeEach(() => {
    addRequestUnwrap.mockReset()
    addRequest.mockReset()
    addProject.mockReset()
  })

  it('désactive « Créer » tant qu’aucun projet n’est sélectionné', async () => {
    render(<ModalCreateNewRequest onClose={vi.fn()} />)

    await screen.findByPlaceholderText('Nom de la requête')
    expect(createButton()).toBeDisabled()
  })

  it('active « Créer » avec « Nouveau projet » et un nom de projet non vide', async () => {
    render(<ModalCreateNewRequest onClose={vi.fn()} />)
    await screen.findByPlaceholderText('Nom de la requête')

    await selectNewProject()
    expect(createButton()).toBeEnabled()

    fireEvent.change(screen.getByPlaceholderText('Nom du nouveau projet'), { target: { value: '  ' } })
    expect(createButton()).toBeDisabled()
  })

  it('crée le projet puis la requête rattachée à ce projet', async () => {
    addProject.mockResolvedValue({ uuid: 'p-new', name: 'Projet de recherche par défaut' })
    addRequestUnwrap.mockResolvedValue({})
    render(<ModalCreateNewRequest onClose={vi.fn()} />)
    await screen.findByPlaceholderText('Nom de la requête')

    await selectNewProject()
    fireEvent.click(createButton())

    await waitFor(() => expect(addRequestUnwrap).toHaveBeenCalled())
    expect(addProject).toHaveBeenCalledWith({ name: 'Projet de recherche par défaut' })
    expect(addRequest).toHaveBeenCalledWith({
      newRequest: expect.objectContaining({ parent_folder: { uuid: 'p-new', name: 'Projet de recherche par défaut' } })
    })
  })

  it('arrête le chargement si la création de la requête échoue', async () => {
    addProject.mockResolvedValue({ uuid: 'p-new', name: 'Projet de recherche par défaut' })
    addRequestUnwrap.mockRejectedValue(new Error('Impossible de créer la requête'))
    render(<ModalCreateNewRequest onClose={vi.fn()} />)
    await screen.findByPlaceholderText('Nom de la requête')

    await selectNewProject()
    fireEvent.click(createButton())

    await waitFor(() => expect(createButton()).toBeEnabled())
    expect(screen.getByPlaceholderText('Nom de la requête')).toBeInTheDocument()
  })
})
