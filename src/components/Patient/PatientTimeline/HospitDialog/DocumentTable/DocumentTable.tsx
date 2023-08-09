import React, { useState } from 'react'

import { CohortComposition, CompositionStatusKind, DocumentReferenceStatusKind } from 'types'

import {
  Chip,
  Grid,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography
} from '@mui/material'

import { ReactComponent as CancelIcon } from 'assets/icones/times.svg'
import { ReactComponent as CheckIcon } from 'assets/icones/check.svg'

import DocumentViewer from 'components/DocumentViewer/DocumentViewer'

import { getDocumentStatus } from 'utils/documentsFormatter'

import useStyles from './styles'
import { Visibility } from '@mui/icons-material'

type DocumentRowTypes = {
  deidentified: boolean
  document: CohortComposition
  groupId: string
}
const DocumentRow: React.FC<DocumentRowTypes> = ({ deidentified, document, groupId }) => {
  const { classes } = useStyles()
  const [documentDialogOpen, setDocumentDialogOpen] = useState(false)

  const row = {
    ...document,
    NDA: document.NDA,
    title: document.title ?? '-',
    serviceProvider: document.serviceProvider ?? '-',
    event: document.content[0].attachment.url,
    type: document.type?.coding?.[0].display ?? document.type?.coding?.[0].code ?? '-'
  }

  const getStatusShip = (type?: CompositionStatusKind | DocumentReferenceStatusKind) => {
    if (type === 'final' || type === 'current') {
      return (
        <Chip
          className={classes.validChip}
          icon={<CheckIcon height="15px" fill="#FFF" />}
          label={getDocumentStatus(type)}
        />
      )
    } else {
      return (
        <Chip
          className={classes.cancelledChip}
          icon={<CancelIcon height="15px" fill="#FFF" />}
          label={getDocumentStatus(type)}
        />
      )
    }
  }

  return (
    <>
      <TableRow key={row.id} className={classes.tableBodyRows}>
        <TableCell align="left">{row.NDA}</TableCell>
        <TableCell align="left">
          {row.date ? new Date(row.date).toLocaleDateString('fr-FR') : 'Date inconnue'}
        </TableCell>
        <TableCell align="left">{row.type}</TableCell>
        <TableCell align="left" className={classes.description}>
          {row.title}
        </TableCell>
        <TableCell align="center">{row.serviceProvider}</TableCell>
        <TableCell align="center">{getStatusShip(row.status as DocumentReferenceStatusKind)}</TableCell>
        <TableCell align="center">
          <IconButton onClick={() => setDocumentDialogOpen(true)}>
            <Visibility height="30px" />
          </IconButton>
        </TableCell>
      </TableRow>

      <DocumentViewer
        deidentified={deidentified ?? false}
        open={documentDialogOpen}
        handleClose={() => setDocumentDialogOpen(false)}
        documentId={row.id ?? ''}
        list={groupId ? groupId.split(',') : undefined}
      />
    </>
  )
}

type DocumentTableTypes = {
  deidentified: boolean
  documents?: CohortComposition[]
  page: number
  documentLines: number
}
const DocumentTable: React.FC<DocumentTableTypes> = ({ deidentified, documents, page, documentLines }) => {
  const { classes } = useStyles()

  const search = new URLSearchParams(location.search)
  const groupId = search.get('groupId') ?? ''

  return (
    <>
      {documents && documents.length > 0 ? (
        <TableContainer component={Paper}>
          <Table className={classes.table} aria-label="simple table">
            <TableHead className={classes.tableHead}>
              <TableRow>
                <TableCell align="left" className={classes.tableHeadCell}>
                  {deidentified ? 'NDA chiffré' : 'NDA'}
                </TableCell>
                <TableCell align="left" className={classes.tableHeadCell}>
                  Date
                </TableCell>
                <TableCell align="left" className={classes.tableHeadCell}>
                  Type
                </TableCell>
                <TableCell align="left" className={classes.tableHeadCell}>
                  Description
                </TableCell>
                <TableCell align="center" className={classes.tableHeadCell}>
                  Unité exécutrice
                </TableCell>
                <TableCell align="center" className={classes.tableHeadCell}>
                  Statut
                </TableCell>
                <TableCell align="center" className={classes.tableHeadCell}>
                  PDF
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {documents.slice((page - 1) * documentLines, page * documentLines).map((document, index) => (
                <DocumentRow
                  key={`docRow ${index}`}
                  document={document}
                  deidentified={deidentified}
                  groupId={groupId}
                />
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      ) : (
        <Grid container justifyContent="center">
          <Typography variant="button"> Aucun document à afficher </Typography>
        </Grid>
      )}
    </>
  )
}

export default DocumentTable
