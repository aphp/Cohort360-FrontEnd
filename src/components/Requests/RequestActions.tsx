import { Typography, Snackbar, Alert, Grid, Hidden, IconButton, Menu, MenuItem, Tooltip } from '@mui/material'
import CheckboxFilter from 'components/Filters/CheckboxFilter'
import ProjectsFilter from 'components/Filters/ProjectsFilter'
import TextInput from 'components/Filters/TextInput'
import UsersFilter from 'components/Filters/UsersFilters'
import React, { useEffect, useState } from 'react'
import services from 'services/aphp'
import { deleteRequest, editRequest } from 'services/requests/api'
import { fetchUsers } from 'services/users/api'
import { RequestType, ResponseStatus } from 'types'
import { Direction, LabelObject, Order } from 'types/searchCriterias'
import { Delete } from '@mui/icons-material'
import EditIcon from '@mui/icons-material/Edit'
import ShareIcon from '@mui/icons-material/Share'
import MoreVertIcon from '@mui/icons-material/MoreVert'
import { FetchProjectsResponse, fetchProjects } from 'services/projects/api'
import Modal from 'components/ui/Modal'

enum Dialog {
  EDIT,
  DELETE,
  SHARE,
  SHARE_UNABLE
}

type RequestActionsProps = {
  request: RequestType
  disabled?: boolean
  onUpdate: () => void
}

const RequestActions = ({ request, disabled = false, onUpdate }: RequestActionsProps) => {
  const [openModal, setOpenModal] = useState<Dialog | null>(null)
  const [shareStatus, setShareStatus] = useState<ResponseStatus>(ResponseStatus.IDDLE)
  const [anchorEl, setAnchorEl] = React.useState(null)
  const [projects, setProjects] = useState<FetchProjectsResponse | null>(null)
  const openMenuItem = Boolean(anchorEl)

  const handleFetchProjects = async () => {
    const response = await fetchProjects({
      orderBy: { orderBy: Order.NAME, orderDirection: Direction.ASC },
      limit: 100
    })
    setProjects(response)
  }

  const handleDelete = async () => {
    setOpenModal(null)
    await deleteRequest(request)
    await onUpdate()
  }

  const handleShare = async (name: string, users: LabelObject[], notifyByEmail: boolean) => {
    const usersIds = users.map((user) => user.id)
    const requestId = request?.query_snapshots?.[0].uuid
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
    const copy = { ...request } as RequestType
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
    await editRequest(copy!)
    await handleFetchProjects()
    await onUpdate()
    setOpenModal(null)
  }

  useEffect(() => {
    handleFetchProjects()
  }, [])

  return (
    <>
      <Hidden lgDown>
        <Grid
          container
          direction="row"
          alignItems="center"
          justifyContent="center"
          style={{ width: 'max-content', margin: 'auto' }}
        >
          <Grid item>
            <Tooltip title={'Partager la requête'}>
              <IconButton
                style={{ padding: 8 }}
                size="small"
                onClick={(event) => {
                  event.stopPropagation()
                  setOpenModal(request?.query_snapshots?.length === 0 ? Dialog.SHARE_UNABLE : Dialog.SHARE)
                }}
                disabled={disabled}
              >
                <ShareIcon />
              </IconButton>
            </Tooltip>
          </Grid>
          <Grid item>
            <Tooltip title={'Modifier la requête'}>
              <IconButton
                size="small"
                style={{ padding: 8 }}
                onClick={(event) => {
                  event.stopPropagation()
                  setOpenModal(Dialog.EDIT)
                }}
                disabled={disabled}
              >
                <EditIcon />
              </IconButton>
            </Tooltip>
          </Grid>
          <Grid item>
            <Tooltip title={'Supprimer la requête'}>
              <IconButton
                style={{ padding: 8 }}
                size="small"
                onClick={(event) => {
                  event.stopPropagation()
                  setOpenModal(Dialog.DELETE)
                }}
                disabled={disabled}
              >
                <Delete color="warning" />
              </IconButton>
            </Tooltip>
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
          }}
        >
          <MoreVertIcon />
        </IconButton>
        <Menu anchorEl={anchorEl} open={openMenuItem} onClose={() => setAnchorEl(null)}>
          <MenuItem
            onClick={(event) => {
              event.stopPropagation()
              setOpenModal(Dialog.SHARE)
              setAnchorEl(null)
            }}
            disabled={disabled}
          >
            <ShareIcon /> Partager
          </MenuItem>
          <MenuItem
            onClick={(event) => {
              event.stopPropagation()
              setOpenModal(Dialog.EDIT)
              setAnchorEl(null)
            }}
            disabled={disabled}
          >
            <EditIcon /> Modifier
          </MenuItem>
          <MenuItem
            onClick={(event) => {
              event.stopPropagation()
              setOpenModal(Dialog.DELETE)
              setAnchorEl(null)
            }}
            disabled={disabled}
          >
            <Delete /> Supprimer
          </MenuItem>
        </Menu>
      </Hidden>
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
        <TextInput value={request?.name} name="name" label="Nom de la requête :" minLimit={2} maxLimit={255} />
        <ProjectsFilter name="project" projects={projects?.results || []} value={request?.parent_folder} />
        <TextInput
          value={request?.description}
          name="description"
          label="Description :"
          description
          noSpace={false}
          minRows={5}
          maxRows={8}
        />
      </Modal>
      {request?.query_snapshots?.length! > 0 && (
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
            value={request?.name}
            name="name"
            label="Nom de la requête à partager :"
            minLimit={2}
            maxLimit={255}
          />
          <UsersFilter onFetch={fetchUsers} name="users" />
          <CheckboxFilter name="sendMail" label="Envoyer un email au destinataire de la requête" />
        </Modal>
      )}
      {openModal === Dialog.SHARE_UNABLE && (
        <Snackbar open autoHideDuration={5000} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
          <Alert severity="error" onClose={() => setShareStatus(ResponseStatus.IDDLE)}>
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

export default RequestActions
