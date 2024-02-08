import { MenuItem, Select, TextField, Typography } from '@mui/material'
import { InputWrapper } from 'components/ui/Inputs'
import { FormContext } from 'components/ui/Modal'
import React, { useContext, useEffect, useState } from 'react'
import { ProjectType } from 'types'

type ProjectsFilterProps = {
  value?: string
  projects: ProjectType[]
  name: string
}

const ProjectsFilter = ({ name, value, projects }: ProjectsFilterProps) => {
  const context = useContext(FormContext)
  const NEW_PROJECT_ID = 'new'
  const [project, setProject] = useState(value || NEW_PROJECT_ID)
  const [newProject, setNewProject] = useState(`Projet de recherche ${projects.length}`)

  useEffect(() => {
    if (context?.updateFormData)
      context.updateFormData(name, { projectName: project, newProjectName: project === NEW_PROJECT_ID ? newProject : null })
  }, [project, newProject])

  return (
    <>
      <InputWrapper>
        <Typography variant="h3">Projet :</Typography>
        <Select fullWidth value={project} onChange={(event) => setProject(event.target.value)}>
          {projects.map((e) => (
            <MenuItem value={e.uuid}>{e.name}</MenuItem>
          ))}
          <MenuItem value={NEW_PROJECT_ID}>Nouveau projet</MenuItem>
        </Select>
      </InputWrapper>
      {project === NEW_PROJECT_ID && (
        <InputWrapper>
          <Typography variant="h3">Nom du nouveau projet :</Typography>
          <TextField value={newProject} onChange={(e) => setNewProject(e.target.value)} fullWidth />
        </InputWrapper>
      )}
    </>
  )
}

export default ProjectsFilter
