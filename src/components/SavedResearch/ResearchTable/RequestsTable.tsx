import React, { useState } from 'react'
import { useHistory } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import moment from 'moment'

import {
  Button,
  Dialog,
  DialogActions,
  DialogTitle,
  Grid,
  IconButton,
  Paper,
  Menu,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableSortLabel,
  TableRow,
  Typography,
  Hidden
} from '@material-ui/core'

import DeleteOutlineIcon from '@material-ui/icons/DeleteOutline'

import EditIcon from '@material-ui/icons/Edit'
import MoreVertIcon from '@material-ui/icons/MoreVert'

import ModalAddOrEditRequest from 'components/Cohort/CreationCohort/Modals/ModalCreateNewRequest/ModalCreateNewRequest'

import { useAppSelector } from 'state'
import {
  RequestState,
  setSelectedRequest as setSelectedRequestState,
  deleteRequest as deleteRequestState
} from 'state/request'

import { RequestType } from 'types'

import useStyles from './styles'

type RequestsTableProps = {
  simplified?: boolean
  onClickRow?: Function
  researchData?: RequestType[]
  sortBy?: string
  sortDirection?: 'asc' | 'desc'
  onRequestSort?: any
}
const RequestsTable: React.FC<RequestsTableProps> = ({
  onClickRow,
  researchData,
  sortBy,
  sortDirection,
  onRequestSort
}) => {
  const classes = useStyles()
  const dispatch = useDispatch()
  const history = useHistory()

  const { requestState } = useAppSelector<{
    requestState: RequestState
  }>((state) => ({
    requestState: state.request
  }))
  const selectedRequestState = requestState.selectedRequest

  const [dialogOpen, setOpenDialog] = useState(false)
  const [selectedRequest, setSelectedRequest] = useState<string | undefined>()
  const [anchorEl, setAnchorEl] = React.useState(null)
  const openMenuItem = Boolean(anchorEl)

  const _onClickRow = (row: any) => {
    return !row.uuid ? null : onClickRow ? onClickRow(row) : history.push(`/cohort/new/${row.uuid}`)
  }

  const handleClickOpenDialog = () => {
    setOpenDialog(true)
  }

  const handleCloseDialog = () => {
    setOpenDialog(false)
  }

  const createSortHandler = (property: any) => (event: React.MouseEvent<unknown>) => {
    onRequestSort(event, property)
  }

  return (
    <>
      {
        //@ts-ignore
        !researchData?.length > 0 ? (
          <Grid container justifyContent="center">
            <Typography variant="button"> Aucune requête à afficher </Typography>
          </Grid>
        ) : (
          <TableContainer component={Paper}>
            <Table className={classes.table} aria-label="simple table">
              <TableHead>
                <TableRow className={classes.tableHead}>
                  <TableCell
                    className={classes.tableHeadCell}
                    sortDirection={sortBy === 'name' ? sortDirection : false}
                  >
                    {sortDirection ? (
                      <TableSortLabel
                        active={sortBy === 'name'}
                        direction={sortBy === 'name' ? sortDirection : 'asc'}
                        onClick={createSortHandler('name')}
                      >
                        Titre
                      </TableSortLabel>
                    ) : (
                      'Titre'
                    )}
                  </TableCell>
                  <TableCell
                    className={classes.tableHeadCell}
                    align="center"
                    sortDirection={sortBy === 'modified_at' ? sortDirection : false}
                  >
                    {sortDirection ? (
                      <TableSortLabel
                        active={sortBy === 'modified_at'}
                        direction={sortBy === 'modified_at' ? sortDirection : 'asc'}
                        onClick={createSortHandler('modified_at')}
                      >
                        Date de modification
                      </TableSortLabel>
                    ) : (
                      'Date de modification'
                    )}
                  </TableCell>
                  <TableCell align="center" className={classes.tableHeadCell}>
                    Actions
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {researchData?.map((row: RequestType) => (
                  <TableRow className={classes.pointerHover} hover key={row.uuid}>
                    <TableCell onClick={() => _onClickRow(row)}>{row.name}</TableCell>
                    <TableCell onClick={() => _onClickRow(row)} align="center">
                      {moment(row.modified_at).format('DD/MM/YYYY [à] HH:mm')}
                    </TableCell>
                    <TableCell align="center">
                      <Hidden mdDown>
                        <Grid
                          container
                          direction="row"
                          alignItems="center"
                          justifyContent="center"
                          style={{ width: 'max-content', margin: 'auto' }}
                        >
                          <Grid item>
                            <IconButton
                              size="small"
                              onClick={(event) => {
                                event.stopPropagation()
                                dispatch(setSelectedRequestState(row ?? null))
                              }}
                            >
                              <EditIcon />
                            </IconButton>
                          </Grid>

                          <Grid item>
                            <IconButton
                              size="small"
                              onClick={(event) => {
                                event.stopPropagation()
                                handleClickOpenDialog()
                                setSelectedRequest(row.uuid)
                              }}
                            >
                              <DeleteOutlineIcon />
                            </IconButton>
                          </Grid>
                        </Grid>
                      </Hidden>
                      <Hidden lgUp>
                        <IconButton
                          aria-label="more"
                          id="long-button"
                          aria-controls="long-menu"
                          aria-expanded={openMenuItem ? 'true' : undefined}
                          aria-haspopup="true"
                          onClick={(event) => {
                            event.stopPropagation()
                            // @ts-ignore
                            setAnchorEl(event.currentTarget)
                            setSelectedRequest(row.uuid)
                          }}
                        >
                          <MoreVertIcon />
                        </IconButton>
                        <Menu
                          anchorEl={anchorEl}
                          open={openMenuItem && row.uuid === selectedRequest}
                          onClose={() => setAnchorEl(null)}
                        >
                          <MenuItem
                            className={classes.menuItem}
                            onClick={(event) => {
                              event.stopPropagation()
                              dispatch(setSelectedRequestState(row ?? null))
                              setAnchorEl(null)
                            }}
                          >
                            <EditIcon /> Modifier
                          </MenuItem>
                          <MenuItem
                            className={classes.menuItem}
                            onClick={(event) => {
                              event.stopPropagation()
                              setSelectedRequest(row.uuid)
                              handleClickOpenDialog()
                              setAnchorEl(null)
                            }}
                          >
                            <DeleteOutlineIcon /> Supprimer
                          </MenuItem>
                        </Menu>
                      </Hidden>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )
      }

      <Dialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        aria-labelledby="alert-dialog-slide-title"
        aria-describedby="alert-dialog-slide-description"
      >
        <DialogTitle id="alert-dialog-slide-title">Etes-vous sûr de vouloir supprimer la requête ?</DialogTitle>
        <DialogActions>
          <Button onClick={handleCloseDialog} color="primary">
            Non
          </Button>
          <Button
            onClick={() => {
              handleCloseDialog()
              const foundItem = researchData?.find(({ uuid }) => uuid === selectedRequest)
              if (!foundItem) return
              dispatch<any>(deleteRequestState({ deletedRequest: foundItem }))
            }}
            color="secondary"
          >
            Oui
          </Button>
        </DialogActions>
      </Dialog>

      {selectedRequestState && <ModalAddOrEditRequest onClose={() => dispatch<any>(setSelectedRequestState(null))} />}
    </>
  )
}

export default RequestsTable
