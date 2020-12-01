import React, { useState, useEffect } from 'react'

import { Dialog, DialogActions, DialogTitle } from '@material-ui/core'
import DocumentTable from '../../PatientDocs/DocumentTable/DocumentTable'

import Pagination from '@material-ui/lab/Pagination'

import {
  IDocumentReference
  // IEncounter
} from '@ahryman40k/ts-fhir-types/lib/R4'
import { CohortComposition } from 'types'

import useStyles from './styles'

type HospitDialogTypes = {
  open: boolean
  onClose: () => void
  documents?: (CohortComposition | IDocumentReference)[]
}
const HospitDialog: React.FC<HospitDialogTypes> = ({ open, onClose, documents }) => {
  const classes = useStyles()
  const documentLines = 4 // Number of desired lines in the document array
  const [page, setPage] = useState(1)

  const handleChange = (_event: any, value: React.SetStateAction<number>) => {
    setPage(value)
  }

  useEffect(() => {
    setPage(1)
  }, [open])

  return (
    <Dialog onClose={onClose} aria-labelledby="simple-dialog-title" open={open} maxWidth={'lg'}>
      <DialogTitle id="simple-dialog-title">Hospitalisation</DialogTitle>
      {documents && <DocumentTable documentLines={documentLines} documents={documents} page={page} />}
      <DialogActions>
        <Pagination
          className={classes.pagination}
          count={Math.ceil((documents?.length ?? 0) / documentLines)}
          variant="outlined"
          shape="rounded"
          onChange={handleChange}
        />
      </DialogActions>
    </Dialog>
  )
}
export default HospitDialog
