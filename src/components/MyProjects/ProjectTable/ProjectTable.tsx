import React from 'react'

import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@material-ui/core'

import ProjectRow from './ProjectRow/ProjectRow'

import { ProjectType, RequestType } from 'services/myProjects'

import useStyles from './styles'

type ProjectTableProps = {
  projectList: ProjectType[]
  requestList: RequestType[]
  onEditProject: (selectedProjectId: string | null) => void
}
const ProjectTable: React.FC<ProjectTableProps> = ({ projectList, requestList, onEditProject }) => {
  const classes = useStyles()

  return (
    <TableContainer component={Paper}>
      <Table aria-label="projects table" className={classes.table}>
        <TableHead>
          <TableRow className={classes.tableHead}>
            <TableCell className={classes.tableHeadCell} align="center" style={{ width: 62 }} />
            <TableCell className={classes.tableHeadCell} align="center" style={{ width: 62 }} />
            <TableCell className={classes.tableHeadCell}>Titre</TableCell>
            <TableCell className={`${classes.tableHeadCell} ${classes.dateCell}`} align="center">
              Date
            </TableCell>
          </TableRow>
        </TableHead>

        <TableBody>
          {projectList.map((project) => (
            <ProjectRow
              key={project.uuid}
              row={project}
              requestOfProject={requestList.filter(({ project_id }) => project_id === project.uuid)}
              onEditProject={onEditProject}
            />
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  )
}

export default ProjectTable
