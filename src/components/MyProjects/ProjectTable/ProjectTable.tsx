import React, { useEffect, useState } from 'react'

import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Typography } from '@material-ui/core'

import ProjectRow from './ProjectRow/ProjectRow'

import { ProjectType } from 'services/myProjects'

import { useAppSelector } from 'state'
import { ProjectState } from 'state/project'
import { RequestState } from 'state/request'

import useStyles from './styles'

type ProjectTableProps = {
  searchInput?: string
}

const ProjectTable: React.FC<ProjectTableProps> = ({ searchInput }) => {
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

  const [searchProjectList, setSearchProjectList] = useState(projectsList || [])
  const [searchRequestList, setSearchRequestList] = useState(requestsList || [])

  useEffect(() => {
    // eslint-disable-next-line
    const regexp = new RegExp(`${(searchInput || '').replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, '\\$&')}`)

    const newSearchRequestList = !searchInput
      ? requestsList
      : requestsList.filter(({ name }) => name.search(regexp) !== -1)

    const newSearchProjectList = !searchInput
      ? projectsList
      : projectsList.filter(
          ({ name, uuid }) =>
            name.search(regexp) !== -1 || !!newSearchRequestList.find(({ parent_folder }) => parent_folder === uuid)
        )

    setSearchProjectList(newSearchProjectList)
    setSearchRequestList(newSearchRequestList)

    return () => {
      setSearchProjectList([])
      setSearchRequestList([])
    }
  }, [searchInput])

  return (
    <TableContainer component={Paper} className={classes.grid}>
      <Table aria-label="projects table" id="projects_table" className={classes.table}>
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
          {searchProjectList.length === 0 && (
            <TableRow>
              <TableCell style={{ textAlign: 'center', height: '40vh' }} colSpan={4}>
                <Typography>Aucun projet de recherche {!!searchInput && 'trouvé'}</Typography>
              </TableCell>
            </TableRow>
          )}
          {searchProjectList.map((project: ProjectType) => (
            <ProjectRow
              key={project.uuid}
              row={project}
              requestOfProject={
                searchRequestList && searchRequestList.length > 0
                  ? searchRequestList.filter(({ parent_folder }) => parent_folder === project.uuid)
                  : requestsList.filter(({ parent_folder }) => parent_folder === project.uuid)
              }
            />
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  )
}

export default ProjectTable
