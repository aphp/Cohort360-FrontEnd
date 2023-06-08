import React, { useState, useEffect } from 'react'

import { CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle, Pagination } from '@mui/material'
import DocumentTable from 'components/Patient/PatientTimeline/HospitDialog/DocumentTable/DocumentTable'

import { CohortComposition } from 'types'

import useStyles from './styles'

type HospitDialogTypes = {
  deidentified: boolean
  open: boolean
  onClose: () => void
  documents?: CohortComposition[]
  loading: boolean
}
const HospitDialog: React.FC<HospitDialogTypes> = ({ deidentified, open, onClose, documents, loading }) => {
  const { classes } = useStyles()
  const documentLines = 4 // Number of desired lines in the document array
  const [page, setPage] = useState(1)

  const handleChange = (_event: any, value: React.SetStateAction<number>) => {
    setPage(value)
  }

  useEffect(() => {
    setPage(1)
  }, [open])

  return (
    <Dialog
      onClose={onClose}
      aria-labelledby="simple-dialog-title"
      open={open}
      maxWidth={'lg'}
      className={classes.dialogContent}
    >
      <DialogTitle id="simple-dialog-title">Documents</DialogTitle>
      <DialogContent className={classes.dialogContent}>
        {loading ? (
          <CircularProgress className={classes.loading} />
        ) : (
          <>
            {documents && (
              <DocumentTable
                documentLines={documentLines}
                documents={documents}
                page={page}
                deidentified={deidentified}
              />
            )}
          </>
        )}
      </DialogContent>
      <DialogActions>
        <Pagination
          className={classes.pagination}
          count={Math.ceil((documents?.length ?? 0) / documentLines)}
          variant="outlined"
          shape="circular"
          onChange={handleChange}
        />
      </DialogActions>
    </Dialog>
  )
}
export default HospitDialog
