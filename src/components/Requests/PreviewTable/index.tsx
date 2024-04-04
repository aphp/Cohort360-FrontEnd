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
  TableRow,
  Typography,
  Hidden,
  Snackbar,
  CircularProgress
} from '@mui/material'

import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline'

import EditIcon from '@mui/icons-material/Edit'
import ShareIcon from '@mui/icons-material/Share'
import MoreVertIcon from '@mui/icons-material/MoreVert'

import ModalAddOrEditRequest from 'components/CreationCohort/Modals/ModalCreateNewRequest/ModalCreateNewRequest'

import { useAppSelector, useAppDispatch } from 'state'
import {
  setSelectedRequest as setSelectedRequestState,
  setSelectedRequestShare as setSelectedRequestShareState,
  deleteRequest as deleteRequestState
} from 'state/request'

import { RequestType, SimpleStatus } from 'types'

import useStyles from '../../CohortsTable/styles'
import ModalShareRequest from '../Modals/ModalShareRequest/ModalShareRequest'

type RequestsTableProps = {
  data: RequestType[]
  loading: boolean
}
const RequestsTable = ({ data, loading }: RequestsTableProps) => {
  const { classes } = useStyles()
  const dispatch = useAppDispatch()
  const navigate = useNavigate()

  const requestState = useAppSelector((state) => state.request)
  const selectedRequestState = requestState.selectedRequest
  const selectedRequestShareState = requestState.selectedRequestShare

  const maintenanceIsActive = useAppSelector((state) => state.me?.maintenance?.active ?? false)

  const [dialogOpen, setOpenDialog] = useState(false)
  const [selectedRequest, setSelectedRequest] = useState<string | undefined>()
  const [anchorEl, setAnchorEl] = React.useState(null)
  const [shareSuccessOrFailMessage, setShareSuccessOrFailMessage] = useState<SimpleStatus>(null)
  const wrapperSetShareSuccessOrFailMessage = useCallback(
    (val: SimpleStatus) => {
      setShareSuccessOrFailMessage(val)
    },
    [setShareSuccessOrFailMessage]
  )
  const openMenuItem = Boolean(anchorEl)

  const _onClickRow = (row: RequestType) => {
    if (!row.uuid) return
    navigate(`/cohort/new/${row.uuid}`)
  }

  const handleClickOpenDialog = () => {
    setOpenDialog(true)
  }

  const handleCloseDialog = () => {
    setOpenDialog(false)
  }

  return (
    <>
      {loading && (
        <Grid container justifyContent="center">
          <CircularProgress />
        </Grid>
      )}
      {
        //@ts-ignore
        !loading && data.length < 1 && (
          <Grid container justifyContent="center">
            <Typography variant="button"> Aucune requête à afficher </Typography>
          </Grid>
        )
      }
      {!loading && data.length > 0 && (
        <TableContainer component={Paper}>
          <Table className={classes.table} aria-label="simple table">
            <TableHead>
              <TableRow className={classes.tableHead}>
                <TableCell className={classes.tableHeadCell}>Titre</TableCell>
                <TableCell className={classes.tableHeadCell} align="center">
                  Date de modification
                </TableCell>
                <TableCell align="center" className={classes.tableHeadCell}>
                  Actions
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {data?.map((row: RequestType) => (
                <TableRow className={classes.pointerHover} hover key={row.uuid}>
                  <TableCell onClick={() => _onClickRow(row)}>
                    {row.shared_by?.display_name ? (
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
      )}

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
              const foundItem = data?.find(({ uuid }) => uuid === selectedRequest)
              if (!foundItem) return
              dispatch(deleteRequestState({ deletedRequest: foundItem }))
            }}
            color="secondary"
          >
            Oui
          </Button>
        </DialogActions>
      </Dialog>

      {selectedRequestState && <ModalAddOrEditRequest onClose={() => dispatch(setSelectedRequestState(null))} />}
      {selectedRequestShareState !== null &&
        selectedRequestShareState?.shared_query_snapshot !== undefined &&
        selectedRequestShareState?.shared_query_snapshot?.length > 0 && (
          <ModalShareRequest
            shareSuccessOrFailMessage={shareSuccessOrFailMessage}
            parentStateSetter={wrapperSetShareSuccessOrFailMessage}
            onClose={() => dispatch(setSelectedRequestShareState(null))}
          />
        )}

      {selectedRequestShareState !== null &&
        selectedRequestShareState?.shared_query_snapshot !== undefined &&
        selectedRequestShareState?.shared_query_snapshot?.length === 0 && (
          <Snackbar
            open
            onClose={() => dispatch(setSelectedRequestShareState(null))}
            autoHideDuration={5000}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          >
            <Alert severity="error" onClose={() => dispatch(setSelectedRequestShareState(null))}>
              Votre requête ne possède aucun critère. Elle ne peut donc pas être partagée.
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
