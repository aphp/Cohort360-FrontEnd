import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import moment from 'moment'

import {
  Alert,
  Grid,
  IconButton,
  Paper,
  Menu,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Hidden,
  Snackbar,
  CircularProgress
} from '@mui/material'

import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline'

import EditIcon from '@mui/icons-material/Edit'
import ShareIcon from '@mui/icons-material/Share'
import MoreVertIcon from '@mui/icons-material/MoreVert'

import { useAppSelector } from 'state'
import { RequestType, ResponseStatus } from 'types'

import useStyles from '../../CohortsTable/styles'
import Modal from 'components/ui/Modal'
import TextInput from 'components/Filters/TextInput'
import ProjectsFilter from 'components/Filters/ProjectsFilter'
import { FetchProjectsResponse, fetchProjects } from 'services/projects/api'
import { deleteRequest, editRequest } from 'services/requests/api'
import services from 'services/aphp'
import UsersFilter from 'components/Filters/UsersFilters'
import { Direction, LabelObject, Order } from 'types/searchCriterias'
import { fetchUsers } from 'services/users/api'
import CheckboxFilter from 'components/Filters/CheckboxFilter'

enum Dialog {
  EDIT,
  DELETE,
  SHARE
}

type RequestsTableProps = {
  data: RequestType[]
  loading: boolean
  onUpdate: () => void
}
const RequestsTable = ({ data, loading, onUpdate }: RequestsTableProps) => {
  const { classes } = useStyles()
  const navigate = useNavigate()

  const maintenanceIsActive = useAppSelector((state) => state.me?.maintenance?.active ?? false)

  const [openModal, setOpenModal] = useState<Dialog | null>(null)
  const [selectedRequest, setSelectedRequest] = useState<RequestType | null>(null)
  const [projects, setProjects] = useState<FetchProjectsResponse | null>(null)
  const [anchorEl, setAnchorEl] = React.useState(null)
  const [shareStatus, setShareStatus] = useState<ResponseStatus>(ResponseStatus.IDDLE)
  const openMenuItem = Boolean(anchorEl)

  const _onClickRow = (row: any) => {
    if (!row.uuid) return
    navigate(`/cohort/new/${row.uuid}`)
  }

  const handleFetchProjects = async () => {
    const response = await fetchProjects({ orderBy: Order.NAME, orderDirection: Direction.ASC }, 100)
    setProjects(response)
  }

  const handleDelete = async () => {
    setOpenModal(null)
    await deleteRequest(selectedRequest!)
    await onUpdate()
  }

  const handleShare = async (name: string, users: LabelObject[], notifyByEmail: boolean) => {
    const usersIds = users.map((user) => user.id)
    const requestId = selectedRequest?.query_snapshots?.[0].uuid
    if (requestId) {
      const shareRequestResponse = await services.projects.shareRequest(requestId, name, usersIds, notifyByEmail)
      if (shareRequestResponse?.status === 201) {
        setShareStatus(ResponseStatus.SUCCESS)
        await onUpdate()
      } else {
        setShareStatus(ResponseStatus.ERROR)
      }
    }
  }

  const handleEdit = async ({ name, description, project: { projectName, newProjectName } }: any) => {
    const copy = { ...selectedRequest } as RequestType
    if (newProjectName && newProjectName.length > 2 && newProjectName.length < 55) {
      const newProject = await services.projects.addProject({ uuid: '', name: newProjectName })
      if (newProject) {
        copy.parent_folder = newProject.uuid
      }
    } else if (projectName) {
      copy.parent_folder = projectName
    }
    if (name) copy.name = name
    if (description) copy.description = description
    await editRequest(copy)
    await handleFetchProjects()
    await onUpdate()
    setOpenModal(null)
  }

  useEffect(() => {
    handleFetchProjects()
  }, [])

  return (
    <>
      {loading && (
        <Grid container justifyContent="center">
          <CircularProgress />
        </Grid>
      )}
      {!loading && data.length < 1 && (
        <Grid container justifyContent="center">
          <Typography variant="button"> Aucune requête à afficher </Typography>
        </Grid>
      )}
      {!loading && data.length > 0 && (
        <TableContainer component={Paper}>
          <Table className={classes.table} aria-label="simple table">
            <TableHead>
              <TableRow className={classes.tableHead}>
                <TableCell className={classes.tableHeadCell}>Titre</TableCell>
                <TableCell className={classes.tableHeadCell} align="center">
                  Date de modification
                </TableCell>
                <TableCell align="center" className={classes.tableHeadCell}>
                  Actions
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {data?.map((row: RequestType) => (
                <TableRow className={classes.pointerHover} hover key={row.uuid}>
                  <TableCell onClick={() => _onClickRow(row)}>
                    {row.shared_by?.display_name ? (
                      <>
                        {row.name} - Envoyée par : {row.shared_by.firstname} {row.shared_by.lastname?.toUpperCase()}
                      </>
                    ) : (
                      <>{row.name}</>
                    )}
                  </TableCell>
                  <TableCell onClick={() => _onClickRow(row)} align="center">
                    {moment(row.modified_at).format('DD/MM/YYYY [à] HH:mm')}
                  </TableCell>
                  <TableCell align="center">
                    <Hidden lgDown>
                      <Grid
                        container
                        direction="row"
                        alignItems="center"
                        justifyContent="center"
                        style={{ width: 'max-content', margin: 'auto' }}
                      >
                        <Grid item>
                          <IconButton
                            size="small"
                            onClick={(event) => {
                              event.stopPropagation()
                              setOpenModal(Dialog.EDIT)
                              setSelectedRequest(row)
                            }}
                            disabled={maintenanceIsActive}
                          >
                            <EditIcon />
                          </IconButton>
                        </Grid>

                        <Grid item>
                          <IconButton
                            size="small"
                            onClick={(event) => {
                              event.stopPropagation()
                              setOpenModal(Dialog.SHARE)
                              setSelectedRequest(row)
                            }}
                            disabled={maintenanceIsActive}
                          >
                            <ShareIcon />
                          </IconButton>
                        </Grid>

                        <Grid item>
                          <IconButton
                            size="small"
                            onClick={(event) => {
                              event.stopPropagation()
                              setOpenModal(Dialog.DELETE)
                              setSelectedRequest(row)
                            }}
                            disabled={maintenanceIsActive}
                          >
                            <DeleteOutlineIcon />
                          </IconButton>
                        </Grid>
                      </Grid>
                    </Hidden>
                    <Hidden lgUp>
                      <IconButton
                        aria-label="more"
                        id="long-button"
                        aria-controls="long-menu"
                        aria-expanded={openMenuItem ? 'true' : undefined}
                        aria-haspopup="true"
                        onClick={(event) => {
                          event.stopPropagation()
                          // @ts-ignore
                          setAnchorEl(event.currentTarget)
                          setSelectedRequest(row)
                        }}
                      >
                        <MoreVertIcon />
                      </IconButton>
                      <Menu
                        anchorEl={anchorEl}
                        open={openMenuItem && row === selectedRequest}
                        onClose={() => setAnchorEl(null)}
                      >
                        <MenuItem
                          className={classes.menuItem}
                          onClick={(event) => {
                            event.stopPropagation()
                            setSelectedRequest(row)
                            setOpenModal(Dialog.SHARE)
                            setAnchorEl(null)
                          }}
                          disabled={maintenanceIsActive}
                        >
                          <ShareIcon /> Partager
                        </MenuItem>
                        <MenuItem
                          className={classes.menuItem}
                          onClick={(event) => {
                            event.stopPropagation()
                            setSelectedRequest(row)
                            setOpenModal(Dialog.EDIT)
                            setAnchorEl(null)
                          }}
                          disabled={maintenanceIsActive}
                        >
                          <EditIcon /> Modifier
                        </MenuItem>
                        <MenuItem
                          className={classes.menuItem}
                          onClick={(event) => {
                            event.stopPropagation()
                            setSelectedRequest(row)
                            setOpenModal(Dialog.DELETE)
                            setAnchorEl(null)
                          }}
                          disabled={maintenanceIsActive}
                        >
                          <DeleteOutlineIcon /> Supprimer
                        </MenuItem>
                      </Menu>
                    </Hidden>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Modal
        open={openModal === Dialog.DELETE}
        title="Supprimer une requête"
        onSubmit={handleDelete}
        onClose={() => setOpenModal(null)}
        validationText="Supprimer"
      >
        <Typography>Êtes-vous sûr(e) de vouloir supprimer la requête ?</Typography>
      </Modal>

      <Modal
        open={openModal === Dialog.EDIT}
        title="Modifier la requête"
        onSubmit={handleEdit}
        onClose={() => setOpenModal(null)}
        validationText="Modifier"
      >
        <TextInput value={selectedRequest?.name} name="name" label="Nom de la requête :" minLimit={2} maxLimit={255} />
        <ProjectsFilter name="project" projects={projects?.results || []} value={selectedRequest?.parent_folder} />
        <TextInput
          value={selectedRequest?.description}
          name="description"
          label="Description :"
          description
          noSpace={false}
          minRows={5}
          maxRows={8}
        />
      </Modal>

      <Modal
        open={openModal === Dialog.SHARE}
        title="Partager la requête"
        onSubmit={({ name, users, sendMail }) => {
          handleShare(name, users, sendMail)
        }}
        width={'700px'}
        onClose={() => setOpenModal(null)}
        validationText="Envoyer"
      >
        <TextInput
          value={selectedRequest?.name}
          name="name"
          label="Nom de la requête à partager :"
          minLimit={2}
          maxLimit={255}
        />
        <UsersFilter onFetch={fetchUsers} name="users" />
        <CheckboxFilter name="sendMail" label="Envoyer un email au destinataire de la requête" />
      </Modal>

      {selectedRequest?.query_snapshots?.length === 0 && (
        <Snackbar open autoHideDuration={5000} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
          <Alert severity="error" onClose={() => setSelectedRequest(null)}>
            Votre requête ne possède aucun critère. Elle ne peux donc pas être partagée.
          </Alert>
        </Snackbar>
      )}

      {shareStatus === ResponseStatus.SUCCESS && (
        <Snackbar open autoHideDuration={5000} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
          <Alert severity="success" onClose={() => setShareStatus(ResponseStatus.IDDLE)}>
            Votre requête a été partagée.
          </Alert>
        </Snackbar>
      )}

      {shareStatus === ResponseStatus.ERROR && (
        <Snackbar open autoHideDuration={5000} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
          <Alert severity="error" onClose={() => setShareStatus(ResponseStatus.IDDLE)}>
            Une erreur est survenue, votre requête n'a pas pu être partagée.
          </Alert>
        </Snackbar>
      )}
    </>
  )
}

export default RequestsTable
