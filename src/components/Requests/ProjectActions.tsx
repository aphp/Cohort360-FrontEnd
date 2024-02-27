import { Typography, Grid, Hidden, IconButton, Menu, MenuItem, Tooltip } from '@mui/material'
import TextInput from 'components/Filters/TextInput'
import React, { useState } from 'react'
import { ProjectType } from 'types'
import { Delete } from '@mui/icons-material'
import EditIcon from '@mui/icons-material/Edit'
import AddIcon from '@mui/icons-material/Add'
import MoreVertIcon from '@mui/icons-material/MoreVert'
import Modal from 'components/ui/Modal'
import servicesProjects from 'services/aphp/serviceProjects'

enum Dialog {
  EDIT,
  DELETE,
  ADD_REQUEST
}

type ProjectActionsProps = {
  project: ProjectType
  disabled?: boolean
  onUpdate: () => void
}

const ProjectActions = ({ project, disabled = false, onUpdate }: ProjectActionsProps) => {
  const [openModal, setOpenModal] = useState<Dialog | null>(null)
  const [anchorEl, setAnchorEl] = React.useState(null)
  const openMenuItem = Boolean(anchorEl)

  const handleEditProject = async (name: string) => {
    await servicesProjects.editProject({ ...project, name })
    onUpdate()
  }

  const handleDeleteProject = async (name: string) => {
    await servicesProjects.deleteProject(project)
    onUpdate()
  }

  const handleAddRequest = async (name: string, description: string) => {
    await servicesProjects.addRequest({ name, description, parent_folder: project.uuid, uuid: '' })
    onUpdate()
  }

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
            <Tooltip title={'Ajouter une requête'}>
              <IconButton onClick={() => setOpenModal(Dialog.ADD_REQUEST)} disabled={disabled}>
                <AddIcon />
              </IconButton>
            </Tooltip>
          </Grid>
          <Grid item>
            <Tooltip title={'Modifier le projet'}>
              <IconButton onClick={() => setOpenModal(Dialog.EDIT)} disabled={disabled}>
                <EditIcon color="action" />
              </IconButton>
            </Tooltip>
          </Grid>
          <Grid item>
            <Tooltip title={'Supprimer le projet'}>
              <IconButton onClick={() => setOpenModal(Dialog.DELETE)} disabled={disabled} color="warning">
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
              setOpenModal(Dialog.ADD_REQUEST)
              setAnchorEl(null)
            }}
            disabled={disabled}
          >
            <AddIcon /> Ajouter une requête
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
        <TextInput value={project?.name} name="name" label="Nom du projet :" minLimit={2} maxLimit={255} />
      </Modal>

      <Modal
        open={openModal === Dialog.ADD_REQUEST}
        color="secondary"
        title="Ajouter une requête"
        onSubmit={({ name, description }) => handleAddRequest(name, description)}
        onClose={() => setOpenModal(null)}
        validationText="Ajouter"
      >
        <TextInput name="info" disabled value={project.name} label="Projet parent :" minLimit={2} maxLimit={255} />
        <TextInput name="name" label="Nom de la requête :" minLimit={2} maxLimit={255} />
        <TextInput name="description" label="Description :" description noSpace={false} minRows={5} maxRows={8} />
      </Modal>
    </>
  )
}

export default ProjectActions
