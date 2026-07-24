import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import RequestForm from 'components/CreationCohort/Modals/ModalCreateNewRequest/components/RequestForm'
import { ProjectType, RequestType } from 'types'

const projectList: ProjectType[] = [
  { uuid: 'p1', name: 'Projet 1' } as ProjectType,
  { uuid: 'p2', name: 'Projet 2' } as ProjectType
]

const request = (overrides: Partial<RequestType> = {}): RequestType =>
  ({ uuid: '', name: 'Ma requête', description: '', parent_folder: { uuid: 'p1' }, ...overrides }) as RequestType

describe('RequestForm', () => {
  it('affiche les champs nom et projet', () => {
    render(
      <RequestForm
        currentRequest={request()}
        onChangeValue={vi.fn()}
        error={null}
        projectName=""
        onChangeProjectName={vi.fn()}
        projectList={projectList}
      />
    )
    expect(screen.getByPlaceholderText('Nom de la requête')).toBeInTheDocument()
    expect(screen.getByText('Projet :')).toBeInTheDocument()
  })

  it('notifie le changement de nom', () => {
    const onChangeValue = vi.fn()
    render(
      <RequestForm
        currentRequest={request()}
        onChangeValue={onChangeValue}
        error={null}
        projectName=""
        onChangeProjectName={vi.fn()}
        projectList={projectList}
      />
    )
    fireEvent.change(screen.getByPlaceholderText('Nom de la requête'), { target: { value: 'Nouvelle' } })
    expect(onChangeValue).toHaveBeenCalledWith('name', 'Nouvelle')
  })

  it('affiche le champ nom de nouveau projet quand parent_folder = new', () => {
    render(
      <RequestForm
        currentRequest={request({ parent_folder: { uuid: 'new' } as never })}
        onChangeValue={vi.fn()}
        error={null}
        projectName="Mon nouveau projet"
        onChangeProjectName={vi.fn()}
        projectList={projectList}
      />
    )
    expect(screen.getByPlaceholderText('Nom du nouveau projet')).toBeInTheDocument()
  })

  it('affiche une erreur de titre', () => {
    render(
      <RequestForm
        currentRequest={request({ name: '' })}
        onChangeValue={vi.fn()}
        error={'error_title'}
        projectName=""
        onChangeProjectName={vi.fn()}
        projectList={projectList}
      />
    )
    expect(screen.getByText(/au moins un caractère/)).toBeInTheDocument()
  })
})
