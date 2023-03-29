import React, { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import moment from 'moment'

import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
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
  Hidden,
  Snackbar
} from '@mui/material'

import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline'

import EditIcon from '@mui/icons-material/Edit'
import ShareIcon from '@mui/icons-material/Share'
import MoreVertIcon from '@mui/icons-material/MoreVert'

import ModalAddOrEditRequest from 'components/CreationCohort/Modals/ModalCreateNewRequest/ModalCreateNewRequest'
import ModalShareRequest from 'components/MyProjects/Modals/ModalShareRequest/ModalShareRequest'

import { useAppSelector, useAppDispatch } from 'state'
import {
  RequestState,
  setSelectedRequest as setSelectedRequestState,
  setSelectedRequestShare as setSelectedRequestShareState,
  deleteRequest as deleteRequestState
} from 'state/request'

import { MeState } from 'state/me'

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
  const dispatch = useAppDispatch()
  const navigate = useNavigate()

  const { requestState } = useAppSelector<{
    requestState: RequestState
  }>((state) => ({
    requestState: state.request
  }))
  const selectedRequestState = requestState.selectedRequest
  const selectedRequestShareState = requestState.selectedRequestShare

  const { meState } = useAppSelector<{
    meState: MeState
  }>((state) => ({
    meState: state.me
  }))
  const maintenanceIsActive = meState?.maintenance?.active

  const [dialogOpen, setOpenDialog] = useState(false)
  const [selectedRequest, setSelectedRequest] = useState<string | undefined>()
  const [anchorEl, setAnchorEl] = React.useState(null)
  const [shareSuccessOrFailMessage, setShareSuccessOrFailMessage] = useState<'success' | 'error' | null>(null)
  const wrapperSetShareSuccessOrFailMessage = useCallback(
    (val: any) => {
      setShareSuccessOrFailMessage(val)
    },
    [setShareSuccessOrFailMessage]
  )
  const openMenuItem = Boolean(anchorEl)

  const _onClickRow = (row: any) => {
    return !row.uuid ? null : onClickRow ? onClickRow(row) : navigate(`/cohort/new/${row.uuid}`)
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
                    <TableCell onClick={() => _onClickRow(row)}>
                      {row.shared_by?.displayed_name ? (
                        <>
                          {row.name} - Envoyée par : {row.shared_by.firstname} {row.shared_by.lastname?.toUpperCase()}
                        </>
                      ) : (
                        <>{row.name}</>
                      )}
                    </TableCell>
                    <TableCell onClick={() => _onClickRow(row)} align="center">
                      {moment(row.modified_at).format('DD/MM/YYYY [à] HH:mm')}
                    </TableCell>
                    <TableCell align="center">
                      <Hidden lgDown>
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
                              disabled={maintenanceIsActive}
                            >
                              <EditIcon />
                            </IconButton>
                          </Grid>

                          <Grid item>
                            <IconButton
                              size="small"
                              onClick={(event) => {
                                event.stopPropagation()
                                dispatch(setSelectedRequestShareState(row ?? null))
                              }}
                              disabled={maintenanceIsActive}
                            >
                              <ShareIcon />
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
                              disabled={maintenanceIsActive}
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
                            disabled={maintenanceIsActive}
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
                            disabled={maintenanceIsActive}
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
        <DialogTitle>Supprimer une requête</DialogTitle>

        <DialogContent>
          <Typography>Êtes-vous sûr(e) de vouloir supprimer cette requête ?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Non</Button>
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
      {selectedRequestShareState !== null &&
        selectedRequestShareState?.shared_query_snapshot !== undefined &&
        selectedRequestShareState?.shared_query_snapshot?.length > 0 && (
          <ModalShareRequest
            shareSuccessOrFailMessage={shareSuccessOrFailMessage}
            parentStateSetter={wrapperSetShareSuccessOrFailMessage}
            onClose={() => dispatch<any>(setSelectedRequestShareState(null))}
          />
        )}

      {selectedRequestShareState !== null &&
        selectedRequestShareState?.shared_query_snapshot !== undefined &&
        selectedRequestShareState?.shared_query_snapshot?.length === 0 && (
          <Snackbar
            open
            onClose={() => dispatch<any>(setSelectedRequestShareState(null))}
            autoHideDuration={5000}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          >
            <Alert severity="error" onClose={() => dispatch<any>(setSelectedRequestShareState(null))}>
              Votre requête ne possède aucun critère. Elle ne peux donc pas être partagée.
            </Alert>
          </Snackbar>
        )}

      {shareSuccessOrFailMessage === 'success' && (
        <Snackbar
          open
          onClose={() => setShareSuccessOrFailMessage(null)}
          autoHideDuration={5000}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        >
          <Alert severity="success" onClose={() => setShareSuccessOrFailMessage(null)}>
            Votre requête a été partagée.
          </Alert>
        </Snackbar>
      )}

      {shareSuccessOrFailMessage === 'error' && (
        <Snackbar
          open
          onClose={() => setShareSuccessOrFailMessage(null)}
          autoHideDuration={5000}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        >
          <Alert severity="error" onClose={() => setShareSuccessOrFailMessage(null)}>
            Une erreur est survenue, votre requête n'a pas pu être partagée.
          </Alert>
        </Snackbar>
      )}
    </>
  )
}

export default RequestsTable
