import React, { useEffect, useState } from 'react'

import { Collapse, IconButton, TableRow, Typography, Tooltip, Grid, Table } from '@mui/material'
import { TableCellWrapper } from 'components/ui/TableCell/styles'

import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown'
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp'
import EditIcon from '@mui/icons-material/Edit'
import AddIcon from '@mui/icons-material/Add'

import RequestRow from '../RequestRow'

import { ProjectType } from 'types'

import { useAppSelector } from 'state'

import { Delete } from '@mui/icons-material'
import Modal from 'components/ui/Modal'
import TextInput from 'components/Filters/TextInput'
import servicesProjects from 'services/aphp/serviceProjects'
import { FetchRequestsResponse, fetchRequestsFromProject } from 'services/requests/api'
import moment from 'moment'

enum Dialog {
  EDIT,
  DELETE,
  ADD_REQUEST
}

type ProjectRowProps = {
  row: ProjectType
  fetchRequests: boolean
  searchInput?: string
  onUpdate: () => void
}
const ProjectRow: React.FC<ProjectRowProps> = ({ row, fetchRequests, searchInput, onUpdate }) => {
  const [openRequests, setOpenRequests] = React.useState(fetchRequests)
  const maintenanceIsActive = useAppSelector((state) => state.me?.maintenance?.active ?? false)
  const [openModal, setOpenModal] = useState<Dialog | null>(null)
  const [requests, setRequests] = useState<FetchRequestsResponse | null>(null)
  const [toggleFetchRequests, setToggleFetchRequests] = useState(fetchRequests)

  const handleEditProject = async (name: string) => {
    await servicesProjects.editProject({ ...row, name })
    onUpdate()
  }

  const handleDeleteProject = async (name: string) => {
    await servicesProjects.deleteProject(row)
    onUpdate()
  }

  const handleAddRequest = async (name: string, description: string) => {
    await servicesProjects.addRequest({ name, description, parent_folder: row.uuid, uuid: '' })
    onUpdate()
  }

  const handleFetchRequests = async () => {
    const response = await fetchRequestsFromProject(row.uuid, { limit: 10 })
    setRequests(response)
  }

  useEffect(() => {
    if (toggleFetchRequests) {
      handleFetchRequests()
      setOpenRequests(true)
    } else {
      setOpenRequests(false)
    }
  }, [toggleFetchRequests])

  return (
    <>
      <TableRow style={{ display: 'flex', width: '100%', color: '#00000099' }}>
        <TableCellWrapper style={{ width: '70px', height: '60px', textAlign: 'left' }}>
          <IconButton style={{ marginLeft: 4 }} aria-label="expand row" size="small">
            {openRequests ? (
              <KeyboardArrowUpIcon style={{ color: '#00000099' }} onClick={() => setToggleFetchRequests(false)} />
            ) : (
              <KeyboardArrowDownIcon style={{ color: '#00000099' }} onClick={() => setToggleFetchRequests(true)} />
            )}
          </IconButton>
        </TableCellWrapper>
        <TableCellWrapper style={{ width: '70px', height: '60px', textAlign: 'left' }}></TableCellWrapper>
        <TableCellWrapper
          style={{ width: '120px', height: '60px', textAlign: 'left', display: 'flex', alignItems: 'center' }}
        >
          <Typography> {moment(row.modified_at).format('DD/MM/YYYY')}</Typography>
        </TableCellWrapper>
        <TableCellWrapper
          align="left"
          style={{
            width: 'calc(100% - 70px - 70px - 120px - 160px)',
            height: '60px',
            display: 'flex',
            alignItems: 'center'
          }}
        >
          <Typography style={{ fontWeight: 900, display: 'inline-table' }}>{row.name}</Typography>
        </TableCellWrapper>
        <TableCellWrapper
          align="left"
          style={{ height: '60px', textAlign: 'left', display: 'flex', alignItems: 'center' }}
        >
          <Tooltip title={'Ajouter une requête'}>
            <IconButton onClick={() => setOpenModal(Dialog.ADD_REQUEST)} disabled={maintenanceIsActive}>
              <AddIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title={'Modifier le projet'}>
            <IconButton onClick={() => setOpenModal(Dialog.EDIT)} disabled={maintenanceIsActive}>
              <EditIcon color="action" />
            </IconButton>
          </Tooltip>
          <Tooltip title={'Supprimer le projet'}>
            <IconButton onClick={() => setOpenModal(Dialog.DELETE)} disabled={maintenanceIsActive} color="warning">
              <Delete color="warning" />
            </IconButton>
          </Tooltip>
        </TableCellWrapper>
      </TableRow>

      {requests && requests?.count > 0 && (
        <Collapse in={openRequests} timeout="auto" unmountOnExit style={{ width: '100%', minHeight: 'fit-content' }}>
          <Table>
            {requests.results.map((request, index) => (
              <RequestRow
                key={request.uuid}
                row={request}
                //cohortsList={cohortsList}
                /*isSearch={
                      !!searchInput &&
                      cohortsList.some(
                        ({ name, ...cohortItem }) => name?.search(regexp) !== -1 && cohortItem.request === request.uuid
                      )
                    }*/
                //selectedRequests={selectedRequests}
                //onSelectedRow={onSelectedRow}
              />
            ))}
          </Table>
        </Collapse>
      )}
      {openRequests && requests && requests.count! === 0 && (
        <TableRow style={{ display: 'flex', width: '100%' }}>
          <TableCellWrapper
            style={{
              width: '100%',
              height: 70,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <Typography fontWeight={700}>Aucune requête associée à ce projet</Typography>
          </TableCellWrapper>
        </TableRow>
      )}

      <Modal
        open={openModal === Dialog.DELETE}
        title="Supprimer le projet de recherche"
        onSubmit={({ name }) => handleDeleteProject(name)}
        onClose={() => setOpenModal(null)}
        validationText="Supprimer"
        color="secondary"
      >
        <Typography>Êtes-vous sûr(e) de vouloir supprimer le projet ?</Typography>
      </Modal>

      <Modal
        open={openModal === Dialog.EDIT}
        title="Modifier le projet de recherche"
        onSubmit={({ name }) => handleEditProject(name)}
        onClose={() => setOpenModal(null)}
        validationText="Modifier"
        color="secondary"
      >
        <TextInput value={row?.name} name="name" label="Nom du projet :" minLimit={2} maxLimit={255} />
      </Modal>

      <Modal
        open={openModal === Dialog.ADD_REQUEST}
        color="secondary"
        title="Ajouter une requête"
        onSubmit={({ name, description }) => handleAddRequest(name, description)}
        onClose={() => setOpenModal(null)}
        validationText="Ajouter"
      >
        <TextInput name="info" disabled value={row.name} label="Projet parent :" minLimit={2} maxLimit={255} />
        <TextInput name="name" label="Nom de la requête :" minLimit={2} maxLimit={255} />
        <TextInput name="description" label="Description :" description noSpace={false} minRows={5} maxRows={8} />
      </Modal>
    </>
  )
}

export default ProjectRow
