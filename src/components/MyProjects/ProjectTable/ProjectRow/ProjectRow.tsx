import React from 'react'

import { Button, Collapse, IconButton, TableCell, TableRow, Typography, Tooltip } from '@mui/material'

import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown'
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp'
import EditIcon from '@mui/icons-material/Edit'
import AddIcon from '@mui/icons-material/Add'

import RequestRow from '../RequestRow/RequestRow'

import { ProjectType, RequestType, Cohort } from 'types'

import { useAppDispatch, useAppSelector } from 'state'
import { setSelectedProject } from 'state/project'
import { setSelectedRequest } from 'state/request'
import { MeState } from 'state/me'

import useStyles from '../styles'

type ProjectRowProps = {
  row: ProjectType
  requestOfProject: RequestType[]
  cohortsList: Cohort[]
  searchInput?: string
  selectedRequests: RequestType[]
  onSelectedRow: (selectedRequests: RequestType[]) => void
}
const ProjectRow: React.FC<ProjectRowProps> = ({
  row,
  requestOfProject,
  cohortsList,
  searchInput,
  selectedRequests,
  onSelectedRow
}) => {
  const [open, setOpen] = React.useState(true)
  const { classes } = useStyles()
  const dispatch = useAppDispatch()

  const { meState } = useAppSelector<{
    meState: MeState
  }>((state) => ({
    meState: state.me
  }))
  const maintenanceIsActive = meState?.maintenance?.active

  const handleClickAddOrEditProject = (selectedProjectId: string | null) => {
    onSelectedRow([])
    if (selectedProjectId) {
      dispatch(setSelectedProject(selectedProjectId))
    } else {
      dispatch(setSelectedProject(null))
    }
  }

  const handleAddRequest = () => {
    onSelectedRow([])
    dispatch(setSelectedRequest({ uuid: '', name: '', parent_folder: row.uuid }))
  }

  // eslint-disable-next-line
  const regexp = new RegExp(`${(searchInput || '').replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, '\\$&')}`, 'gi')

  return (
    <>
      <TableRow>
        <TableCell style={{ width: 62 }}>
          <IconButton style={{ marginLeft: 4 }} aria-label="expand row" size="small" onClick={() => setOpen(!open)}>
            {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
          </IconButton>
        </TableCell>
        <TableCell />
        <TableCell className={classes.tdName}>
          <Typography style={{ fontWeight: 900, display: 'inline-table' }}>{row.name}</Typography>
          {requestOfProject && requestOfProject.length > 0 && (
            <Tooltip title={'Ajouter une requête'}>
              <IconButton
                onClick={handleAddRequest}
                className={classes.smallAddButton}
                size="small"
                disabled={maintenanceIsActive}
              >
                <AddIcon />
              </IconButton>
            </Tooltip>
          )}
          <Tooltip title={'Modifier le projet'}>
            <IconButton
              onClick={() => handleClickAddOrEditProject(row.uuid)}
              className={classes.editButton}
              size="small"
              disabled={maintenanceIsActive}
            >
              <EditIcon />
            </IconButton>
          </Tooltip>
        </TableCell>
        <TableCell className={classes.dateCell} align="center">
          {/* {moment(row.modified_at).format('DD/MM/YYYY [à] HH:mm')} */}
        </TableCell>
      </TableRow>

      <TableRow>
        <TableCell style={{ padding: 0, borderBottomWidth: open ? 1 : 0 }} colSpan={4}>
          <Collapse in={open} timeout="auto" unmountOnExit style={{ width: '100%', minHeight: 'fit-content' }}>
            {requestOfProject && requestOfProject.length > 0 ? (
              requestOfProject.map((request) => (
                <RequestRow
                  key={request.uuid}
                  row={request}
                  cohortsList={cohortsList}
                  isSearch={
                    !!searchInput &&
                    cohortsList.some(
                      ({ name, ...cohortItem }) => name?.search(regexp) !== -1 && cohortItem.request === request.uuid
                    )
                  }
                  selectedRequests={selectedRequests}
                  onSelectedRow={onSelectedRow}
                />
              ))
            ) : (
              <Typography className={classes.emptyRequestRow}>
                Aucune requête n'est associée à ce projet de recherche
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  size="small"
                  onClick={handleAddRequest}
                  className={classes.addButton}
                  style={{ margin: 4 }}
                  disabled={maintenanceIsActive}
                >
                  Ajouter une requête
                </Button>
              </Typography>
            )}
          </Collapse>
        </TableCell>
      </TableRow>
    </>
  )
}

export default ProjectRow
