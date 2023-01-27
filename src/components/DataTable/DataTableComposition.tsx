import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import clsx from 'clsx'

import { CircularProgress, Chip, Grid, IconButton, Typography, TableRow, TableCell } from '@mui/material'

import FolderSharedIcon from '@mui/icons-material/FolderShared'
import DescriptionIcon from '@mui/icons-material/Description'
import LocalHospitalIcon from '@mui/icons-material/LocalHospital'
import { ReactComponent as PdfIcon } from 'assets/icones/file-pdf.svg'
import { ReactComponent as CheckIcon } from 'assets/icones/check.svg'
import { ReactComponent as CancelIcon } from 'assets/icones/times.svg'
import { ReactComponent as UserIcon } from 'assets/icones/user.svg'
import { ReactComponent as SearchIcon } from 'assets/icones/search.svg'

import DataTable from 'components/DataTable/DataTable'
import DocumentViewer from 'components/DocumentViewer/DocumentViewer'

import docTypes from 'assets/docTypes.json'
import Watermark from 'assets/images/watermark_pseudo.svg'

import { getDocumentStatus } from 'utils/documentsFormatter'

import { Column, Order, CohortComposition } from 'types'
import { CompositionStatusKind, DocumentReferenceStatusKind } from '@ahryman40k/ts-fhir-types/lib/R4'

import useStyles from './styles'

type DataTableCompositionProps = {
  loading: boolean
  deidentified: boolean
  showIpp?: boolean
  searchMode: boolean
  groupId?: string
  documentsList: CohortComposition[]
  order?: Order
  setOrder?: (order: Order) => void
  page?: number
  setPage?: (page: number) => void
  total?: number
}
const DataTableComposition: React.FC<DataTableCompositionProps> = ({
  loading,
  deidentified,
  showIpp,
  searchMode,
  groupId,
  documentsList,
  order,
  setOrder,
  page,
  setPage,
  total
}) => {
  const classes = useStyles()

  const columns = [
    {
      multiple: [
        { label: 'Nom', code: '', align: 'center', sortableColumn: false },
        { label: 'Date', code: 'date', align: 'center', sortableColumn: true }
      ]
    },
    showIpp
      ? {
          label: `IPP${deidentified ? ' chiffré' : ''}`,
          code: '',
          align: 'center',
          sortableColumn: false
        }
      : null,
    {
      label: `NDA${deidentified ? ' chiffré' : ''}`,
      code: '',
      align: 'center',
      sortableColumn: false
    },
    { label: 'Unité exécutrice', code: '', align: 'center', sortableColumn: false },
    { label: 'Type de document', code: 'type', align: 'center', sortableColumn: true },
    { label: 'Aperçu', code: '', align: 'center', sortableColumn: false }
  ].filter((elem) => elem !== null) as Column[]

  return (
    <DataTable
      columns={columns}
      order={order}
      setOrder={setOrder}
      rowsPerPage={20}
      page={page}
      setPage={setPage}
      total={total}
    >
      {!loading && documentsList && documentsList.length > 0 ? (
        <>
          {documentsList.map((document) => {
            return (
              <DataTableCompositionLine
                key={document.id}
                showIpp={showIpp}
                deidentified={deidentified}
                document={document}
                searchMode={searchMode}
                groupId={groupId}
              />
            )
          })}
        </>
      ) : (
        <TableRow className={classes.emptyTableRow}>
          <TableCell colSpan={6} align="left">
            <Grid container justifyContent="center">
              {loading ? <CircularProgress /> : <Typography variant="button">Aucun document à afficher</Typography>}
            </Grid>
          </TableCell>
        </TableRow>
      )}
    </DataTable>
  )
}

const DataTableCompositionLine: React.FC<{
  document: CohortComposition
  deidentified: boolean
  showIpp?: boolean
  searchMode: boolean
  groupId?: string
}> = ({ document, deidentified, showIpp, searchMode, groupId }) => {
  const classes = useStyles()
  const navigate = useNavigate()

  const [open, setOpen] = useState<string | null>(null)

  const documentId = document.id
  const title = document.title
  const status = document.status
  const event = document.event
  const ipp = deidentified ? document.idPatient : document.IPP
  const nda = document.NDA ?? '-'
  const serviceProvider = document.serviceProvider ?? 'Non renseigné'
  const docType = docTypes.docTypes.find(
    ({ code }) => code === (document.type?.coding && document.type?.coding[0] ? document.type?.coding[0].code : '-')
  )
  const section = searchMode ? document.section : []
  const date = document.date ? new Date(document.date).toLocaleDateString('fr-FR') : ''
  const hour = document.date
    ? new Date(document.date).toLocaleTimeString('fr-FR', {
        hour: '2-digit',
        minute: '2-digit'
      })
    : ''

  return (
    <React.Fragment key={documentId}>
      <TableRow className={classes.tableBodyRows}>
        <TableCell>
          <Typography variant="button">{title ?? 'Document sans titre'}</Typography>
          <Typography>
            {date} {hour}
          </Typography>
          {getStatusShip(status)}
        </TableCell>

        {showIpp && (
          <TableCell>
            <Grid container alignItems="center" wrap="nowrap">
              <UserIcon height="25px" fill="#5BC5F2" className={classes.iconMargin} />

              <Typography>{ipp}</Typography>

              <IconButton
                onClick={() => navigate(`/patients/${document.idPatient}${groupId ? `?groupId=${groupId}` : ''}`)}
                className={classes.searchIcon}
              >
                <SearchIcon height="15px" fill="#ED6D91" className={classes.iconMargin} />
              </IconButton>
            </Grid>
          </TableCell>
        )}

        <TableCell>
          <Grid container alignItems="center" wrap="nowrap">
            <FolderSharedIcon htmlColor="#5BC5F2" className={clsx(classes.iconSize, classes.iconMargin)} />
            <Typography>{nda}</Typography>
          </Grid>
        </TableCell>

        <TableCell>
          <Grid container alignItems="center" wrap="nowrap">
            <LocalHospitalIcon htmlColor="#5BC5F2" className={clsx(classes.iconSize, classes.iconMargin)} />
            <Typography>{serviceProvider}</Typography>
          </Grid>
        </TableCell>

        <TableCell>
          <Grid container alignItems="center" wrap="nowrap">
            <DescriptionIcon htmlColor="#5BC5F2" className={clsx(classes.iconSize, classes.iconMargin)} />
            <Typography>{docType?.label ?? '-'}</Typography>
          </Grid>
        </TableCell>

        <TableCell>
          <IconButton onClick={() => setOpen(documentId ?? '')} disabled={event === undefined}>
            <PdfIcon height="30px" fill={event === undefined ? '#CBCFCF' : '#ED6D91'} />
          </IconButton>

          <DocumentViewer
            deidentified={deidentified ?? false}
            open={open === documentId}
            handleClose={() => setOpen(null)}
            documentId={documentId ?? ''}
            list={groupId ? groupId.split(',') : undefined}
          />
        </TableCell>
      </TableRow>

      {section && section.length > 0 && (
        <TableRow className={classes.tableBodyRows}>
          <TableCell colSpan={6} style={{ backgroundImage: `url(${Watermark})`, backgroundSize: 'contain' }}>
            {section.map((section) => (
              <Grid key={section.title} container item direction="column">
                <Typography dangerouslySetInnerHTML={{ __html: section.text?.div ?? '' }} />
              </Grid>
            ))}
          </TableCell>
        </TableRow>
      )}
    </React.Fragment>
  )
}

const getStatusShip = (type?: CompositionStatusKind | DocumentReferenceStatusKind) => {
  const classes = useStyles()

  if (type === 'final' || type === 'current') {
    return (
      <Chip
        className={classes.validChip}
        style={{
          width: 95,
          height: 20
        }}
        icon={<CheckIcon height="15px" fill="#FFF" />}
        label={getDocumentStatus(type)}
      />
    )
  } else if (type === 'entered-in-error') {
    return (
      <Chip
        className={classes.cancelledChip}
        style={{
          width: 95,
          height: 20
        }}
        icon={<CancelIcon height="15px" fill="#FFF" />}
        label={getDocumentStatus(type)}
      />
    )
  } else {
    return ''
  }
}

export default DataTableComposition
