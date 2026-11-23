import React from 'react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'

const addRequestUnwrap = vi.fn()
const addRequest = vi.fn()
const addProject = vi.fn()
const setMessage = vi.fn()

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

vi.mock('state/message', () => ({ setMessage: (payload: unknown) => setMessage(payload) }))

vi.mock('services/aphp', () => ({ default: { projects: { addProject: (...args: unknown[]) => addProject(...args) } } }))

import ModalCreateNewRequest from 'components/CreationCohort/Modals/ModalCreateNewRequest/ModalCreateNewRequest'

const createButton = () => screen.getByRole('button', { name: 'Créer' })

describe('ModalCreateNewRequest — utilisateur sans projet', () => {
  beforeEach(() => {
    addRequestUnwrap.mockReset()
    addRequest.mockReset()
    addProject.mockReset()
    setMessage.mockReset()
  })

  it('présélectionne « Nouveau projet » et active « Créer »', async () => {
    render(<ModalCreateNewRequest onClose={vi.fn()} />)

    await screen.findByPlaceholderText('Nom de la requête')
    expect(screen.getByRole('combobox')).toHaveTextContent('Nouveau projet')
    expect(screen.getByPlaceholderText('Nom du nouveau projet')).toHaveValue('Projet de recherche par défaut')
    expect(createButton()).toBeEnabled()
  })

  it('crée le projet puis la requête rattachée à ce projet', async () => {
    addProject.mockResolvedValue({ uuid: 'p-new', name: 'Projet de recherche par défaut' })
    addRequestUnwrap.mockResolvedValue({})
    render(<ModalCreateNewRequest onClose={vi.fn()} />)
    await screen.findByPlaceholderText('Nom de la requête')

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

    fireEvent.click(createButton())

    await waitFor(() => expect(createButton()).toBeEnabled())
    expect(screen.getByPlaceholderText('Nom de la requête')).toBeInTheDocument()
  })

  it('réutilise le projet créé quand on relance après un échec de la requête', async () => {
    addProject.mockResolvedValue({ uuid: 'p-new', name: 'Projet de recherche par défaut' })
    addRequestUnwrap.mockRejectedValueOnce(new Error('Impossible de créer la requête')).mockResolvedValueOnce({})
    render(<ModalCreateNewRequest onClose={vi.fn()} />)
    await screen.findByPlaceholderText('Nom de la requête')

    fireEvent.click(createButton())
    await waitFor(() => expect(createButton()).toBeEnabled())

    fireEvent.click(createButton())
    await waitFor(() => expect(addRequestUnwrap).toHaveBeenCalledTimes(2))

    expect(addProject).toHaveBeenCalledTimes(1)
    expect(addRequest).toHaveBeenLastCalledWith({
      newRequest: expect.objectContaining({ parent_folder: { uuid: 'p-new', name: 'Projet de recherche par défaut' } })
    })
  })

  it('affiche une erreur et ne crée pas la requête si la création du projet échoue', async () => {
    addProject.mockRejectedValue(new Error("Erreur lors de l'ajout du projet"))
    render(<ModalCreateNewRequest onClose={vi.fn()} />)
    await screen.findByPlaceholderText('Nom de la requête')

    fireEvent.click(createButton())

    await waitFor(() => expect(createButton()).toBeEnabled())
    expect(setMessage).toHaveBeenCalledWith({
      type: 'error',
      content: 'Une erreur est survenue lors de la création du projet'
    })
    expect(addRequest).not.toHaveBeenCalled()
  })
})
