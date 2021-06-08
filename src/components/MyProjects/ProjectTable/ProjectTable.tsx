import React from 'react'

import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Typography } from '@material-ui/core'

import ProjectRow from './ProjectRow/ProjectRow'

import { ProjectType } from 'services/myProjects'

import { useAppSelector } from 'state'
import { ProjectState } from 'state/project'
import { RequestState } from 'state/request'

import useStyles from './styles'

const ProjectTable: React.FC = () => {
  const classes = useStyles()
  const { projectState, requestState } = useAppSelector<{
    projectState: ProjectState
    requestState: RequestState
  }>((state) => ({
    projectState: state.project,
    requestState: state.request
  }))
  const { projectsList } = projectState
  const { requestsList } = requestState

  return (
    <TableContainer component={Paper} className={classes.grid}>
      <Table aria-label="projects table" id="projects table" className={classes.table}>
        <TableHead>
          <TableRow className={classes.tableHead}>
            <TableCell className={classes.tableHeadCell} align="center" style={{ width: 62 }} />
            <TableCell className={classes.tableHeadCell} align="center" style={{ width: 62 }} />
            <TableCell className={classes.tableHeadCell} style={{ width: 'calc(100% - 300px' }}>
              Titre
            </TableCell>
            <TableCell className={classes.tableHeadCell} align="center" style={{ width: 175 }}>
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
              requestOfProject={requestsList.filter(({ parent_folder }) => parent_folder === project.uuid)}
            />
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  )
}

export default ProjectTable
