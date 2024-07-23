import React, { useContext, useEffect, useState } from 'react'

import {
  Checkbox,
  Table,
  TableBody,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
  Paper,
  Typography,
  CircularProgress,
  Grid
} from '@mui/material'
import { TableCellWrapper } from 'components/ui/TableCell/styles'

import ProjectRow from './ProjectRow'

import { ProjectType, RequestType, WebSocketJobName, WebSocketJobStatus, WebSocketMessage } from 'types'

import { useAppSelector } from 'state'

import useStyles from './styles'
import { IndeterminateCheckBoxOutlined } from '@mui/icons-material'
import { Direction, Order } from 'types/searchCriterias'
import { WebSocketContext } from 'components/WebSocket/WebSocketProvider'
import servicesCohorts from 'services/aphp/serviceCohorts'

type ProjectTableProps = {
  searchInput?: string
  selectedRequests: RequestType[]
  loading: boolean
  setSelectedRequests: (selectedRequests: RequestType[]) => void
}

const ProjectTable: React.FC<ProjectTableProps> = ({ searchInput, loading, setSelectedRequests, selectedRequests }) => {
  const { classes } = useStyles()

  const projectsList = useAppSelector((state) => state.project.projectsList)
  const requestsList = useAppSelector((state) => state.request.requestsList)
  const cohortsListState = useAppSelector((state) => state.cohort.cohortsList)

  const [sortBy, setSortBy] = useState<'name' | 'updated_at'>('name')
  const [sortDirection, setSortDirection] = useState<Direction>(Direction.ASC)

  const [searchProjectList, setSearchProjectList] = useState(projectsList || [])
  const [currentRequestList, setSearchRequestList] = useState(requestsList || [])
  const [searchCohortList, setSearchCohortList] = useState(cohortsListState || [])

  const [cohortList, setCohortList] = useState(cohortsListState)

  const webSocketContext = useContext(WebSocketContext)

  useEffect(() => {
    setCohortList(cohortsListState)
  }, [cohortsListState])

  useEffect(() => {
    const listener = async (message: WebSocketMessage) => {
      if (message.job_name === WebSocketJobName.CREATE && message.status === WebSocketJobStatus.finished) {
        const websocketUpdatedCohorts = cohortList.map((cohort) => {
          const temp = Object.assign({}, cohort)
          if (temp.uuid === message.uuid) {
            if (temp.dated_measure_global) {
              temp.dated_measure_global = {
                ...temp.dated_measure_global,
                measure_min: message.extra_info?.global ? message.extra_info.global.measure_min : null,
                measure_max: message.extra_info?.global ? message.extra_info.global.measure_max : null
              }
            }
            temp.request_job_status = message.status
            temp.group_id = message.extra_info?.group_id
          }
          return temp
        })
        const newCohortList = await servicesCohorts.fetchCohortsRights(websocketUpdatedCohorts)
        setCohortList(newCohortList)
      }
    }

    webSocketContext?.addListener(listener)
    return () => webSocketContext?.removeListener(listener)
  }, [cohortList, webSocketContext])

  useEffect(() => {
    // eslint-disable-next-line
    const regexp = new RegExp(`${(searchInput || '').replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, '\\$&')}`, 'gi')

    const newSearchCohortList = !searchInput ? cohortList : cohortList.filter(({ name }) => name?.search(regexp) !== -1)

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
  }, [searchInput, projectsList, requestsList, cohortList])

  useEffect(() => {
    let newSearchProjectList = projectsList ? [...projectsList] : []
    let newSearchRequestList = requestsList ? [...requestsList] : []

    switch (sortBy) {
      case 'name': {
        newSearchRequestList = newSearchRequestList.sort((a: RequestType, b: RequestType) => {
          if (a.name > b.name) {
            return sortDirection === Direction.ASC ? 1 : -1
          } else {
            return sortDirection === Direction.ASC ? -1 : 1
          }
        })

        newSearchProjectList = newSearchProjectList.sort((a: ProjectType, b: ProjectType) => {
          if (a.name > b.name) {
            return sortDirection === Direction.ASC ? 1 : -1
          } else {
            return sortDirection === Direction.ASC ? -1 : 1
          }
        })
        break
      }

      case 'updated_at': {
        newSearchRequestList = newSearchRequestList.sort((a: RequestType, b: RequestType) => {
          if (a.updated_at && b.updated_at && a.updated_at > b.updated_at) {
            return sortDirection === Direction.ASC ? 1 : -1
          } else {
            return sortDirection === Direction.ASC ? -1 : 1
          }
        })

        newSearchProjectList = newSearchProjectList.sort((a: ProjectType, b: ProjectType) => {
          if (a.modified_at && b.modified_at && a.modified_at > b.modified_at) {
            return sortDirection === Direction.ASC ? 1 : -1
          } else {
            return sortDirection === Direction.ASC ? -1 : 1
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
  }, [sortBy, sortDirection, projectsList, requestsList, cohortList])

  const handleRequestSort = (property: 'name' | 'updated_at') => {
    const isAsc = sortBy === property && sortDirection === Direction.DESC
    setSortDirection(isAsc ? Direction.ASC : Direction.DESC)
    setSortBy(property)
  }

  const _onSelectedRow = (_selectedRequests: RequestType[]) => {
    setSelectedRequests(_selectedRequests)
  }

  const allRequestsSelected = selectedRequests.length === currentRequestList.length

  return (
    <>
      {loading && (
        <Grid container justifyContent="center">
          <CircularProgress />
        </Grid>
      )}
      {!loading && (
        <TableContainer component={Paper} className={classes.grid}>
          <Table aria-label="projects table" id="projects_table" className={classes.table}>
            <TableHead>
              <TableRow className={classes.tableHead}>
                <TableCellWrapper className={classes.tableHeadCell} style={{ width: 62, padding: '0 16px' }}>
                  <Checkbox
                    size="small"
                    checked={allRequestsSelected}
                    indeterminate={allRequestsSelected ? false : selectedRequests.length !== 0}
                    indeterminateIcon={<IndeterminateCheckBoxOutlined />}
                    onChange={() => {
                      const _selectedRequests = currentRequestList
                      if (selectedRequests.length === 0) {
                        setSelectedRequests(_selectedRequests)
                      } else {
                        setSelectedRequests([])
                      }
                    }}
                    color="secondary"
                  />
                </TableCellWrapper>
                <TableCellWrapper className={classes.tableHeadCell} style={{ width: 62 }} />
                <TableCellWrapper className={classes.tableHeadCell} style={{ width: 'calc(100% - 300px' }}>
                  <TableSortLabel
                    active={sortBy === Order.NAME}
                    direction={sortDirection || Direction.ASC}
                    onClick={() => handleRequestSort(Order.NAME)}
                  >
                    Titre
                  </TableSortLabel>
                </TableCellWrapper>
                <TableCellWrapper className={classes.tableHeadCell} style={{ width: 175 }}>
                  <TableSortLabel
                    active={sortBy === Order.UPDATED}
                    direction={sortDirection || Direction.ASC}
                    onClick={() => handleRequestSort(Order.UPDATED)}
                  >
                    Date
                  </TableSortLabel>
                </TableCellWrapper>
              </TableRow>
            </TableHead>

            <TableBody>
              {searchProjectList.length === 0 && (
                <TableRow>
                  <TableCellWrapper style={{ textAlign: 'center', height: '40vh' }} colSpan={4}>
                    <Typography>Aucun projet de recherche {!!searchInput && 'trouvé'}</Typography>
                  </TableCellWrapper>
                </TableRow>
              )}
              {searchProjectList.map((project: ProjectType) => (
                <ProjectRow
                  key={project.uuid}
                  row={project}
                  searchInput={searchInput}
                  requestOfProject={currentRequestList.filter(({ parent_folder }) => parent_folder === project.uuid)}
                  cohortsList={searchCohortList && searchCohortList.length > 0 ? searchCohortList : cohortList}
                  selectedRequests={selectedRequests}
                  onSelectedRow={_onSelectedRow}
                />
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </>
  )
}

export default ProjectTable
