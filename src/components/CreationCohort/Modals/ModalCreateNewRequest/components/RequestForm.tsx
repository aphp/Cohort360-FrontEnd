import React from 'react'

import { Grid, MenuItem, Select, TextField, Typography } from '@mui/material'

import { ProjectType, RequestType } from 'types'

const ERROR_TITLE = 'error_title'
const ERROR_PROJECT = 'error_project'
const ERROR_PROJECT_NAME = 'error_project_name'
const ERROR_REGEX = 'error_regex'

const NEW_PROJECT_ID = 'new'

interface RequestFormProps {
  currentRequest: RequestType
  onChangeValue: (key: 'name' | 'parent_folder' | 'description', value: string | { uuid: string }) => void
  error: 'error_title' | 'error_project' | 'error_project_name' | 'error_regex' | null
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
  return (
    <>
      <Grid container direction="column" marginBottom={3}>
        <Typography variant="h3">Nom de la requête :</Typography>
        <TextField
          placeholder="Nom de la requête"
          value={currentRequest.name}
          onChange={(e) => onChangeValue('name', e.target.value)}
          autoFocus
          id="title"
          margin="normal"
          fullWidth
          error={error === ERROR_TITLE || error === ERROR_REGEX}
          helperText={
            error === ERROR_TITLE
              ? currentRequest.name.length === 0
                ? 'Le nom de la requête doit comporter au moins un caractère.'
                : 'Le nom est trop long (255 caractères max.)'
              : error === ERROR_REGEX
                ? "Le nom de la cohorte ne peut pas être composé uniquement d'espaces."
                : ''
          }
        />
      </Grid>

      <Grid container direction="column" marginBottom={3}>
        <Typography variant="h3">Projet :</Typography>

        <Select
          id="criteria-occurrenceComparator-select"
          value={currentRequest.parent_folder?.uuid}
          onChange={(event) => onChangeValue('parent_folder', { uuid: event.target.value })}
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

        {currentRequest.parent_folder?.uuid === NEW_PROJECT_ID && (
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

      <Grid container direction="column" marginBottom={3}>
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
