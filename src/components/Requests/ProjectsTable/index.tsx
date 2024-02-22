import React, { Fragment, useEffect, useRef, useState } from 'react'

import {
  Table,
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
import { v4 as uuidv4 } from 'uuid'

import ProjectRow from './ProjectRow'

import { LoadingStatus, ProjectType } from 'types'

import { useAppSelector } from 'state'

import useStyles from './styles'
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
}

const ProjectTable = ({ searchInput }: ProjectTableProps) => {
  const { classes } = useStyles()

  const [results, setResults] = useState<FetchProjectsResponse | null>(null)
  const [orderBy, setOrderBy] = useState<OrderBy>({ orderBy: Order.NAME, orderDirection: Direction.ASC })
  const [toggleAddProjectModal, setToggleAddProjectModal] = useState(false)
  const [loadingStatus, setLoadingStatus] = useState<LoadingStatus>(LoadingStatus.IDDLE)
  const scrollUuid = useRef(uuidv4())
  const maintenanceIsActive = useAppSelector((state) => state.me?.maintenance?.active ?? false)

  const handleClickAddProject = async (name: string) => {
    await services.projects.addProject({ uuid: '', name })
    setLoadingStatus(LoadingStatus.IDDLE)
  }

  const fetchProjects = async (next?: string) => {
    setLoadingStatus(LoadingStatus.FETCHING)
    const response = await fetchProjectsApi({ orderBy, limit: 7, text: searchInput, next })
    if (next) {
      setResults({
        ...response,
        results: [...(results?.results || []), ...response.results]
      })
    } else {
      setResults(response)
    }
    setLoadingStatus(LoadingStatus.SUCCESS)
  }

  useEffect(() => {
    if (loadingStatus === LoadingStatus.IDDLE) fetchProjects()
  }, [loadingStatus])

  useEffect(() => {
    setLoadingStatus(LoadingStatus.IDDLE)
  }, [searchInput, orderBy])

  return (
    <>
      <TableContainer component={Paper} className={classes.grid}>
        <Table aria-label="projects table" id="projects_table" className={classes.table}>
          <TableHead>
            <TableRow>
              <TableCellWrapper className={classes.tableHeadCell} style={{ width: '70px', textAlign: 'left' }} />
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
                    color="info"
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

        {loadingStatus === LoadingStatus.SUCCESS && results?.count === 0 && (
          <Grid container justifyContent="center" alignItems="center" height={300}>
            <Grid item xs={3}>
              <Typography>Aucun projet de recherche trouvé</Typography>
            </Grid>
          </Grid>
        )}

        <Grid
          container
          id={scrollUuid.current}
          className={classes.scrollableDiv}
          item
          xs={12}
          style={{
            overflow: 'auto',
            minHeight: results?.results?.length! * 60,
            maxHeight: 700,
            height:
              (results?.results?.length || 0) < (results?.count || 0)
                ? (results?.results.length || 0) * 60 - 1
                : (results?.results.length || 0) * 60
          }}
        >
          {loadingStatus === LoadingStatus.FETCHING && (
            <Grid container justifyContent="center">
              <CircularProgress />
            </Grid>
          )}
          {loadingStatus === LoadingStatus.SUCCESS && results?.count! > 0 && (
            <InfiniteScroll
              scrollableTarget={scrollUuid.current}
              dataLength={results?.results?.length || 0}
              next={() => fetchProjects(results?.next!)}
              hasMore={(results?.results?.length || 0) < (results?.count || 0)}
              scrollThreshold={0.9}
              loader={<Fragment />}
            >
              {results?.results.map((project: ProjectType, index) => (
                <Grid container item xs={12} alignItems="center" key={project.uuid}>
                  <ProjectRow
                    row={project}
                    fetchRequests={index > 0}
                    searchInput={searchInput}
                    onUpdate={() => setLoadingStatus(LoadingStatus.IDDLE)}
                  />
                </Grid>
              ))}
            </InfiniteScroll>
          )}
        </Grid>
      </TableContainer>

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
