import React, { useEffect, useState } from 'react'

import { Button, Collapse, IconButton, TableRow, Typography, Tooltip, Grid } from '@mui/material'
import { TableCellWrapper } from 'components/ui/TableCell/styles'

import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown'
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp'
import EditIcon from '@mui/icons-material/Edit'
import AddIcon from '@mui/icons-material/Add'

import RequestRow from '../RequestRow'

import { ProjectType, RequestType, Cohort } from 'types'

import { useAppDispatch, useAppSelector } from 'state'
import { setSelectedProject } from 'state/project'
import { setSelectedRequest } from 'state/request'

import useStyles from '../styles'

type ProjectRowProps = {
  row: ProjectType
  //requestOfProject: RequestType[]
  //cohortsList: Cohort[]
  searchInput?: string
  //selectedRequests: RequestType[]
  //onSelectedRow: (selectedRequests: RequestType[]) => void
}
const ProjectRow: React.FC<ProjectRowProps> = ({
  row,
  //requestOfProject,
  //cohortsList,
  searchInput
  //selectedRequests,
  //onSelectedRow
}) => {
  const [open, setOpen] = React.useState(true)
  const { classes } = useStyles()
  const dispatch = useAppDispatch()
  const maintenanceIsActive = useAppSelector((state) => state.me?.maintenance?.active ?? false)

  const handleClickAddOrEditProject = (selectedProjectId: string | null) => {
    //onSelectedRow([])
    if (selectedProjectId) {
      dispatch(setSelectedProject(selectedProjectId))
    } else {
      dispatch(setSelectedProject(null))
    }
  }

  const handleAddRequest = () => {
    /*onSelectedRow([])
    dispatch(setSelectedRequest({ uuid: '', name: '', parent_folder: row.uuid }))*/
  }

  // eslint-disable-next-line
  /* const regexp = new RegExp(`${(searchInput || '').replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, '\\$&')}`, 'gi')*/

  const date = new Date(row.modified_at || '').toLocaleString('fr-FR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  })

  return (
    <>
      <Grid container>
        <TableCellWrapper style={{ width: '70px', textAlign: 'left' }}>
          <IconButton style={{ marginLeft: 4 }} aria-label="expand row" size="small" onClick={() => setOpen(!open)}>
            {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
          </IconButton>
        </TableCellWrapper>
        <TableCellWrapper style={{ width: '120px', textAlign: 'left' }}>
          <Typography>{date}</Typography>
        </TableCellWrapper>
        <TableCellWrapper align="left">
          <Typography style={{ fontWeight: 900, display: 'inline-table' }}>{row.name}</Typography>

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
        </TableCellWrapper>
      </Grid>

      {/*<TableRow>
        <TableCellWrapper align="left" style={{ padding: 0, borderBottomWidth: open ? 1 : 0 }} colSpan={4}>
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
              </Typography>
            )}
          </Collapse>
        </TableCellWrapper>
            </TableRow>*/}
    </>
  )
}

export default ProjectRow
