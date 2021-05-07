import React from 'react'

import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Typography } from '@material-ui/core'

import ProjectRow from './ProjectRow/ProjectRow'

import { ProjectType, RequestType } from 'services/myProjects'

import { useAppSelector } from 'state'
import { ProjectState } from 'state/project'

import useStyles from './styles'

type ProjectTableProps = {
  requestList: RequestType[]
  onEditRequest: (selectedRequestId: string | null) => void
}
const ProjectTable: React.FC<ProjectTableProps> = ({ requestList, onEditRequest }) => {
  const classes = useStyles()
  const { projectState } = useAppSelector<{
    projectState: ProjectState
  }>((state) => ({
    projectState: state.project
  }))
  const { projectsList } = projectState

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
          {projectsList.length === 0 && (
            <TableRow>
              <TableCell style={{ textAlign: 'center', height: '40vh' }} colSpan={4}>
                <Typography>Aucun projet de recherche</Typography>
              </TableCell>
            </TableRow>
          )}
          {projectsList.map((project: ProjectType) => (
            <ProjectRow
              key={project.uuid}
              row={project}
              requestOfProject={requestList.filter(({ project_id }) => project_id === project.uuid)}
              onEditRequest={onEditRequest}
            />
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  )
}

export default ProjectTable
