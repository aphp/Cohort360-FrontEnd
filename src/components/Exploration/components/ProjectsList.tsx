import React from 'react'
import {} from 'state'

import { Grid, Typography } from '@mui/material'
import ProjectCard from 'components/ui/ProjectCard'
import { projects } from 'views/MyResearches/data'

const ProjectsList = () => {
  return (
    <Grid container xs={11} gap="50px">
      <Typography>projectsList</Typography>

      {projects.map((project) => (
        <ProjectCard
          key={project.creationDate} // TODO: mettre autre chose comme key
          title={project.title}
          creationDate={project.creationDate}
          requestNumber={project.requestNumber}
          onclick={() => console.log('hey coucou')}
        />
      ))}
    </Grid>
  )
}

export default ProjectsList
