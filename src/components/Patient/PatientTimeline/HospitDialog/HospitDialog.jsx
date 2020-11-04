import React from 'react'

import Dialog from '@material-ui/core/Dialog'
import DialogTitle from '@material-ui/core/DialogTitle'
import DocumentTable from '../../PatientDocs/DocumentTable/DocumentTable'
import Pagination from '@material-ui/lab/Pagination'
import DialogActions from '@material-ui/core/DialogActions'

import PropTypes from 'prop-types'

import useStyles from './style'

const HospitDialog = ({ open, onClose, documents }) => {
  const classes = useStyles()
  const documentLines = 4 // Number of desired lines in the document array
  const [page, setPage] = React.useState(1)

  const handleChange = (event, value) => {
    setPage(value)
  }

  return (
    <Dialog
      onClose={onClose}
      aria-labelledby="simple-dialog-title"
      open={open}
      maxWidth={'lg'}
    >
      <DialogTitle id="simple-dialog-title">Hospitalisation</DialogTitle>

      <DocumentTable
        documentLines={documentLines}
        documents={documents}
        page={page}
      />
      <DialogActions>
        <Pagination
          className={classes.pagination}
          count={Math.ceil(documents.length / documentLines)}
          variant="outlined"
          shape="rounded"
          onChange={handleChange}
        />
      </DialogActions>
    </Dialog>
  )
}

HospitDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  documents: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      date: PropTypes.string,
      type: PropTypes.object,
      description: PropTypes.string,
      status: PropTypes.string,
      docStatus: PropTypes.string,
      securityLabel: PropTypes.array,
      content: PropTypes.arrayOf(
        PropTypes.shape({
          attachment: PropTypes.shape({ url: PropTypes.string })
        })
      )
    })
  ).isRequired,
  page: PropTypes.number,
  documentLines: PropTypes.number
}

export default HospitDialog
