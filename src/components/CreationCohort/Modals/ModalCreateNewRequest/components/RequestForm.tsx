import React from 'react'

import { Grid, MenuItem, Select, TextField, Typography } from '@mui/material'

import useStyles from '../styles'

import { ProjectType, RequestType } from 'types'

const ERROR_TITLE = 'error_title'
const ERROR_PROJECT = 'error_project'
const ERROR_PROJECT_NAME = 'error_project_name'

const NEW_PROJECT_ID = 'new'

interface RequestFormProps {
  currentRequest: RequestType
  onChangeValue: (key: 'name' | 'parent_folder' | 'description', value: string) => void
  error: 'error_title' | 'error_project' | 'error_project_name' | null
  projectName: string
  onChangeProjectName: (value: string) => void
  projectList: ProjectType[]
}

const RequestForm: React.FC<RequestFormProps> = ({
  currentRequest,
  onChangeValue,
  error,
  projectName,
  onChangeProjectName,
  projectList
}) => {
  const { classes } = useStyles()

  return (
    <>
      <Grid container direction="column" className={classes.inputContainer}>
        <Typography variant="h3">Nom de la requête :</Typography>
        <TextField
          placeholder="Nom de la requête"
          value={currentRequest.name}
          onChange={(e) => onChangeValue('name', e.target.value)}
          autoFocus
          id="title"
          margin="normal"
          fullWidth
          error={error === ERROR_TITLE}
          helperText={
            error === ERROR_TITLE
              ? currentRequest.name.length === 0
                ? 'Le nom de la requête doit comporter au moins un caractère.'
                : 'Le nom est trop long (255 caractères max.)'
              : ''
          }
        />
      </Grid>

      <Grid container direction="column" className={classes.inputContainer}>
        <Typography variant="h3">Projet :</Typography>

        <Select
          id="criteria-occurrenceComparator-select"
          value={currentRequest.parent_folder}
          onChange={(event) => onChangeValue('parent_folder', event.target.value as string)}
          error={error === ERROR_PROJECT}
          style={{ marginTop: 16, marginBottom: 8 }}
        >
          {projectList.map((project, index) => (
            <MenuItem key={index} value={project.uuid}>
              {project.name}
            </MenuItem>
          ))}
          <MenuItem value={NEW_PROJECT_ID}>Nouveau projet</MenuItem>
        </Select>

        {currentRequest.parent_folder === NEW_PROJECT_ID && (
          <TextField
            placeholder="Nom du nouveau projet"
            value={projectName}
            onChange={(e) => onChangeProjectName(e.target.value)}
            id="project_name"
            margin="normal"
            fullWidth
            error={error === ERROR_PROJECT_NAME}
          />
        )}
      </Grid>

      <Grid container direction="column" className={classes.inputContainer}>
        <Typography variant="h3">Description :</Typography>
        <TextField
          placeholder="Description"
          value={currentRequest.description}
          onChange={(e) => onChangeValue('description', e.target.value)}
          id="description"
          margin="normal"
          fullWidth
          multiline
          minRows={5}
          maxRows={8}
        />
      </Grid>
    </>
  )
}

export default RequestForm
