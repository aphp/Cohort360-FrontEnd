import React, { useEffect, useState } from 'react'

import {
  Checkbox,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
  Paper,
  Typography
} from '@material-ui/core'

import ProjectRow from './ProjectRow/ProjectRow'

import { ProjectType, RequestType } from 'types'

import { useAppSelector } from 'state'
import { ProjectState } from 'state/project'
import { RequestState } from 'state/request'
import { CohortState } from 'state/cohort'

import useStyles from './styles'

type ProjectTableProps = {
  searchInput?: string
  selectedRequests: RequestType[]
  setSelectedRequests: (selectedRequests: RequestType[]) => void
}

const ProjectTable: React.FC<ProjectTableProps> = ({ searchInput, setSelectedRequests, selectedRequests }) => {
  const classes = useStyles()
  const { projectState, requestState, cohortState } = useAppSelector<{
    projectState: ProjectState
    requestState: RequestState
    cohortState: CohortState
  }>((state) => ({
    projectState: state.project,
    requestState: state.request,
    cohortState: state.cohort
  }))
  const { projectsList } = projectState
  const { requestsList } = requestState
  const { cohortsList } = cohortState

  const [sortBy, setSortBy] = useState<'name' | 'modified_at'>('name')
  const [sortDirection, setSortDirection] = useState<'desc' | 'asc'>('asc')

  const [searchProjectList, setSearchProjectList] = useState(projectsList || [])
  const [currentRequestList, setSearchRequestList] = useState(requestsList || [])
  const [searchCohortList, setSearchCohortList] = useState(cohortsList || [])

  useEffect(() => {
    // eslint-disable-next-line
    const regexp = new RegExp(`${(searchInput || '').replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, '\\$&')}`, 'gi')

    const newSearchCohortList = !searchInput
      ? cohortsList
      : cohortsList.filter(({ name }) => name.search(regexp) !== -1)

    const newSearchRequestList = !searchInput
      ? requestsList
      : requestsList.filter(
          ({ name, uuid }) =>
            name.search(regexp) !== -1 || !!newSearchCohortList.find(({ request }) => request === uuid)
        )

    const newSearchProjectList = !searchInput
      ? projectsList
      : projectsList.filter(
          ({ name, uuid }) =>
            name.search(regexp) !== -1 || !!newSearchRequestList.find(({ parent_folder }) => parent_folder === uuid)
        )

    setSearchCohortList(newSearchCohortList && newSearchCohortList.length > 0 ? newSearchCohortList : [])
    setSearchRequestList(newSearchRequestList && newSearchRequestList.length > 0 ? newSearchRequestList : [])
    setSearchProjectList(newSearchProjectList && newSearchProjectList.length > 0 ? newSearchProjectList : [])

    return () => {
      setSearchProjectList([])
      setSearchRequestList([])
      setSearchCohortList([])
    }
  }, [searchInput, projectsList, requestsList, cohortsList])

  useEffect(() => {
    let newSearchProjectList = projectsList ? [...projectsList] : []
    let newSearchRequestList = requestsList ? [...requestsList] : []

    switch (sortBy) {
      case 'name': {
        newSearchRequestList = newSearchRequestList.sort((a: RequestType, b: RequestType) => {
          if (a.name > b.name) {
            return sortDirection === 'asc' ? 1 : -1
          } else {
            return sortDirection === 'asc' ? -1 : 1
          }
        })

        newSearchProjectList = newSearchProjectList.sort((a: ProjectType, b: ProjectType) => {
          if (a.name > b.name) {
            return sortDirection === 'asc' ? 1 : -1
          } else {
            return sortDirection === 'asc' ? -1 : 1
          }
        })
        break
      }

      case 'modified_at': {
        newSearchRequestList = newSearchRequestList.sort((a: RequestType, b: RequestType) => {
          if (a.modified_at && b.modified_at && a.modified_at > b.modified_at) {
            return sortDirection === 'asc' ? 1 : -1
          } else {
            return sortDirection === 'asc' ? -1 : 1
          }
        })

        newSearchProjectList = newSearchProjectList.sort((a: ProjectType, b: ProjectType) => {
          if (a.modified_at && b.modified_at && a.modified_at > b.modified_at) {
            return sortDirection === 'asc' ? 1 : -1
          } else {
            return sortDirection === 'asc' ? -1 : 1
          }
        })
        break
      }
      default:
        break
    }

    setSearchProjectList(newSearchProjectList)
    setSearchRequestList(newSearchRequestList)

    return () => {
      setSearchProjectList([])
      setSearchRequestList([])
    }
  }, [sortBy, sortDirection, projectsList, requestsList, cohortsList])

  const handleRequestSort = (property: 'name' | 'modified_at') => {
    const isAsc = sortBy === property && sortDirection === 'desc'
    setSortDirection(isAsc ? 'asc' : 'desc')
    setSortBy(property)
  }

  const _onSelectedRow = (_selectedRequests: RequestType[]) => {
    setSelectedRequests(_selectedRequests)
  }

  const allRequestsSelected = selectedRequests.length === currentRequestList.length

  return (
    <TableContainer component={Paper} className={classes.grid}>
      <Table aria-label="projects table" id="projects_table" className={classes.table}>
        <TableHead>
          <TableRow className={classes.tableHead}>
            <TableCell className={classes.tableHeadCell} align="center" style={{ width: 62, padding: '0 16px' }}>
              <Checkbox
                size="small"
                checked={allRequestsSelected}
                indeterminate={allRequestsSelected ? false : selectedRequests.length !== 0}
                onChange={() => {
                  const _selectedRequests = currentRequestList
                  if (selectedRequests.length === 0) {
                    setSelectedRequests(_selectedRequests)
                  } else {
                    setSelectedRequests([])
                  }
                }}
              />
            </TableCell>
            <TableCell className={classes.tableHeadCell} align="center" style={{ width: 62 }} />
            <TableCell className={classes.tableHeadCell} style={{ width: 'calc(100% - 300px' }}>
              <TableSortLabel
                active={sortBy === 'name'}
                direction={sortDirection || 'asc'}
                onClick={() => handleRequestSort('name')}
              >
                Titre
              </TableSortLabel>
            </TableCell>
            <TableCell className={classes.tableHeadCell} align="center" style={{ width: 175 }}>
              <TableSortLabel
                active={sortBy === 'modified_at'}
                direction={sortDirection || 'asc'}
                onClick={() => handleRequestSort('modified_at')}
              >
                Date
              </TableSortLabel>
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
              searchInput={searchInput}
              requestOfProject={currentRequestList.filter(({ parent_folder }) => parent_folder === project.uuid)}
              cohortsList={searchCohortList && searchCohortList.length > 0 ? searchCohortList : cohortsList}
              selectedRequests={selectedRequests}
              onSelectedRow={_onSelectedRow}
            />
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  )
}

export default ProjectTable
