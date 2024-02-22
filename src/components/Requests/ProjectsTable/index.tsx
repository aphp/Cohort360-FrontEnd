import React, { useEffect, useState } from 'react'

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
  Grid,
  Hidden,
  Tooltip,
  IconButton
} from '@mui/material'
import { TableCellWrapper } from 'components/ui/TableCell/styles'

import ProjectRow from './ProjectRow'

import { LoadingStatus, ProjectType, RequestType } from 'types'

import { useAppSelector } from 'state'

import useStyles from './styles'
import { IndeterminateCheckBoxOutlined } from '@mui/icons-material'
import { Direction, Order, OrderBy } from 'types/searchCriterias'
import { FetchProjectsResponse, fetchProjects as fetchProjectsApi } from 'services/projects/api'
import Modal from 'components/ui/Modal'
import TextInput from 'components/Filters/TextInput'
import services from 'services/aphp'
import Button from 'components/ui/Button'
import AddIcon from '@mui/icons-material/Add'
import InfiniteScroll from 'react-infinite-scroll-component'

type ProjectTableProps = {
  searchInput?: string
  // projects: ProjectType[]
  //selectedRequests: RequestType[]
  //loading: boolean
  //setSelectedRequests: (selectedRequests: RequestType[]) => void
}

const ProjectTable = ({
  searchInput /*, loading, projects, setSelectedRequests, selectedRequests*/
}: ProjectTableProps) => {
  const { classes } = useStyles()

  const [results, setResults] = useState<FetchProjectsResponse | null>(null)

  /*const projectsList = useAppSelector((state) => state.project.projectsList)
  const requestsList = useAppSelector((state) => state.request.requestsList)
  const cohortsList = useAppSelector((state) => state.cohort.cohortsList)*/

  const [orderBy, setOrderBy] = useState<OrderBy>({ orderBy: Order.NAME, orderDirection: Direction.ASC })

  /*const [searchProjectList, setSearchProjectList] = useState(projectsList || [])
  const [currentRequestList, setSearchRequestList] = useState(requestsList || [])
  const [searchCohortList, setSearchCohortList] = useState(cohortsList || [])*/
  const [toggleAddProjectModal, setToggleAddProjectModal] = useState(false)
  const [loadingStatus, setLoadingStatus] = useState<LoadingStatus>(LoadingStatus.IDDLE)

  const maintenanceIsActive = useAppSelector((state) => state.me?.maintenance?.active ?? false)

  const handleClickAddProject = async (name: string) => {
    await services.projects.addProject({ uuid: '', name })
  }

  const fetchProjects = async (next?: string) => {
    setLoadingStatus(LoadingStatus.FETCHING)
    const results = await fetchProjectsApi(orderBy, 5, 0, searchInput, next)
    setResults(results)
    setLoadingStatus(LoadingStatus.SUCCESS)
  }

  useEffect(() => {
    if (loadingStatus === LoadingStatus.IDDLE) fetchProjects()
  }, [loadingStatus])

  useEffect(() => {
    setLoadingStatus(LoadingStatus.IDDLE)
  }, [searchInput, orderBy])

  console.log('info scroll', results)

  return (
    <>
      {loadingStatus === LoadingStatus.FETCHING && (
        <Grid container justifyContent="center">
          <CircularProgress />
        </Grid>
      )}
      {loadingStatus === LoadingStatus.SUCCESS && (
        <TableContainer component={Paper} className={classes.grid}>
          <Table aria-label="projects table" id="projects_table" className={classes.table}>
            <TableHead>
              <TableRow>
                <TableCellWrapper className={classes.tableHeadCell} style={{ width: '70px', textAlign: 'left' }} />
                <TableCellWrapper className={classes.tableHeadCell} style={{ width: '120px', textAlign: 'left' }}>
                  <TableSortLabel
                    active={orderBy.orderBy === Order.MODIFIED}
                    direction={orderBy.orderDirection}
                    onClick={() =>
                      setOrderBy({
                        orderBy: Order.MODIFIED,
                        orderDirection: orderBy.orderDirection === Direction.ASC ? Direction.DESC : Direction.ASC
                      })
                    }
                  >
                    Date
                  </TableSortLabel>
                </TableCellWrapper>
                <TableCellWrapper className={classes.tableHeadCell} style={{ width: '50%', textAlign: 'left' }}>
                  <TableSortLabel
                    active={orderBy.orderBy === Order.NAME}
                    direction={orderBy.orderDirection}
                    onClick={() =>
                      setOrderBy({
                        orderBy: Order.NAME,
                        orderDirection: orderBy.orderDirection === Direction.ASC ? Direction.DESC : Direction.ASC
                      })
                    }
                  >
                    Titre
                  </TableSortLabel>
                </TableCellWrapper>

                <TableCellWrapper className={classes.tableHeadCell} style={{ textAlign: 'right' }}>
                  <Hidden only={['xs', 'sm', 'md']}>
                    <Button
                      icon={<AddIcon />}
                      width="200px"
                      onClick={() => setToggleAddProjectModal(true)}
                      disabled={maintenanceIsActive}
                    >
                      Ajouter un projet
                    </Button>
                  </Hidden>
                  <Hidden only={['lg', 'xl']}>
                    <Tooltip title={'Ajouter un projet'}>
                      <IconButton onClick={() => setToggleAddProjectModal(true)} disabled={maintenanceIsActive}>
                        <AddIcon />
                      </IconButton>
                    </Tooltip>
                  </Hidden>
                </TableCellWrapper>
              </TableRow>
            </TableHead>
          </Table>
          {loadingStatus === LoadingStatus.SUCCESS && results?.results.length === 0 && (
            <TableRow>
              <TableCellWrapper style={{ textAlign: 'center', height: '40vh' }} colSpan={4}>
                <Typography>Aucun projet de recherche {!!searchInput && 'trouvé'}</Typography>
              </TableCellWrapper>
            </TableRow>
          )}
          {loadingStatus === LoadingStatus.SUCCESS && (
            <Grid container id="scrollableDiv" style={{ overflow: 'auto', height: '200px', width: '100%' }}>
              <InfiniteScroll
                scrollableTarget="scrollableDiv"
                dataLength={results?.results?.length || 0}
                next={() => setLoadingStatus(LoadingStatus.IDDLE)}
                hasMore={/*(results?.results?.length || 0) < (results?.count || 0)*/ true}
                scrollThreshold={0.9}
                loader={
                  <Grid container justifyContent="center">
                    <Typography fontWeight={500}>Loading...</Typography>
                  </Grid>
                }
              >
                {results?.results.map((project: ProjectType) => (
                  <Grid container>
                    <ProjectRow
                      key={project.uuid}
                      row={project}
                      searchInput={searchInput}
                      //requestOfProject={currentRequestList.filter(({ parent_folder }) => parent_folder === project.uuid)}
                      //cohortsList={searchCohortList && searchCohortList.length > 0 ? searchCohortList : cohortsList}
                      // selectedRequests={selectedRequests}
                      // onSelectedRow={_onSelectedRow}
                    />
                  </Grid>
                ))}
              </InfiniteScroll>
            </Grid>
          )}
        </TableContainer>
      )}

      <Modal
        title="Créer un projet de recherche"
        color="secondary"
        open={toggleAddProjectModal}
        onClose={() => {
          setToggleAddProjectModal(false)
        }}
        onSubmit={({ projectName }) => handleClickAddProject(projectName)}
      >
        <TextInput name="projectName" label="Nom du projet" minLimit={2} maxLimit={255} />
      </Modal>
    </>
  )
}

export default ProjectTable
