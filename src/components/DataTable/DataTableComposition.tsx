import React, { useState } from 'react'
import { Buffer } from 'buffer'
import Parse from 'html-react-parser'

import { CircularProgress, Grid, IconButton, Typography, TableRow } from '@mui/material'
import { TableCellWrapper } from 'components/ui/TableCell/styles'
import DOMPurify from 'dompurify'

import FolderSharedIcon from '@mui/icons-material/FolderShared'
import DescriptionIcon from '@mui/icons-material/Description'
import LocalHospitalIcon from '@mui/icons-material/LocalHospital'
import CheckIcon from 'assets/icones/check.svg?react'
import CancelIcon from 'assets/icones/times.svg?react'
import UserIcon from 'assets/icones/user.svg?react'
import SearchIcon from 'assets/icones/search.svg?react'

import DataTable from 'components/DataTable/DataTable'
import DocumentViewer from 'components/DocumentViewer/DocumentViewer'

import docTypes from 'assets/docTypes.json'
import Watermark from 'assets/images/watermark_pseudo.svg?react'

import { getDocumentStatus } from 'utils/documentsFormatter'

import { Column, CohortComposition } from 'types'

import useStyles from './styles'
import { Visibility } from '@mui/icons-material'
import { DocumentStatuses, Order, OrderBy } from 'types/searchCriterias'
import StatusChip, { ChipStyles } from 'components/ui/StatusChip'
import { DocumentReference } from 'fhir/r4'
import moment from 'moment'

type DataTableCompositionProps = {
  loading: boolean
  deidentified: boolean
  showIpp?: boolean
  searchMode: boolean
  groupId?: string
  documentsList: CohortComposition[]
  orderBy?: OrderBy
  setOrderBy?: (order: OrderBy) => void
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
  orderBy,
  setOrderBy,
  page,
  setPage,
  total
}) => {
  const { classes } = useStyles()

  const columns = [
    { multiple: [{ label: 'Nom' }, { label: 'Date', code: Order.DATE }] },
    showIpp
      ? {
          label: `IPP${deidentified ? ' chiffré' : ''}`
        }
      : null,
    { label: `NDA${deidentified ? ' chiffré' : ''}` },
    { label: 'Unité exécutrice' },
    { label: 'Type de document', code: Order.TYPE },
    { label: 'Aperçu' }
  ].filter((elem) => elem !== null) as Column[]

  return (
    <DataTable columns={columns} order={orderBy} setOrder={setOrderBy} page={page} setPage={setPage} total={total}>
      {!loading && documentsList?.length > 0 && (
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
      )}
      {!loading && documentsList?.length < 1 && (
        <TableRow className={classes.emptyTableRow}>
          <TableCellWrapper colSpan={6} align="left">
            <Grid container justifyContent="center">
              <Typography variant="button">Aucun document à afficher</Typography>
            </Grid>
          </TableCellWrapper>
        </TableRow>
      )}
      {loading && (
        <TableRow className={classes.emptyTableRow}>
          <TableCellWrapper colSpan={6} align="left">
            <Grid container justifyContent="center">
              <CircularProgress />
            </Grid>
          </TableCellWrapper>
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
  const { classes, cx } = useStyles()

  const [open, setOpen] = useState<string | null>(null)

  const documentId = document.id
  const title = document.description
  const status = document.docStatus
  const ipp = document.IPP ?? 'Inconnu'
  const nda = document.NDA ?? 'Inconnu'
  const serviceProvider = document.serviceProvider ?? 'Non renseigné'
  const docType = docTypes.docTypes.find(
    ({ code }) => code === (document?.type?.coding?.[0] ? document.type.coding[0].code : '-')
  )

  const findContent = document?.content?.find((content) => content.attachment?.contentType === 'text/plain')

  const documentContent = findContent?.attachment?.data
    ? Buffer.from(findContent?.attachment.data, 'base64').toString('utf-8')
    : ''
  const date = document.date ? moment(document.date).format('DD/MM/YYYY [à] HH:mm') : 'Date inconnue'

  return (
    <React.Fragment key={documentId}>
      <TableRow className={classes.tableBodyRows}>
        <TableCellWrapper align="left">
          <Typography variant="button">{title ?? 'Document sans titre'}</Typography>
          <Typography>{date}</Typography>
          {getStatusChip(status)}
        </TableCellWrapper>

        {showIpp && (
          <TableCellWrapper>
            <Grid container alignItems="center" wrap="nowrap">
              <UserIcon height="25px" fill="#5BC5F2" className={classes.iconMargin} />

              <Typography>{ipp}</Typography>

              <IconButton
                onClick={() =>
                  window.open(`/patients/${document.idPatient}${groupId ? `?groupId=${groupId}` : ''}`, '_blank')
                }
                className={classes.searchIcon}
              >
                <SearchIcon height="15px" fill="#ED6D91" className={classes.iconMargin} />
              </IconButton>
            </Grid>
          </TableCellWrapper>
        )}

        <TableCellWrapper>
          <Grid container alignItems="center" wrap="nowrap">
            <FolderSharedIcon htmlColor="#5BC5F2" className={cx(classes.iconSize, classes.iconMargin)} />
            <Typography>{nda}</Typography>
          </Grid>
        </TableCellWrapper>

        <TableCellWrapper>
          <Grid container alignItems="center" wrap="nowrap">
            <LocalHospitalIcon htmlColor="#5BC5F2" className={cx(classes.iconSize, classes.iconMargin)} />
            <Typography>{serviceProvider}</Typography>
          </Grid>
        </TableCellWrapper>

        <TableCellWrapper align="left">
          <Grid container alignItems="center" wrap="nowrap">
            <DescriptionIcon htmlColor="#5BC5F2" className={cx(classes.iconSize, classes.iconMargin)} />
            <Typography>{docType?.label ?? '-'}</Typography>
          </Grid>
        </TableCellWrapper>

        <TableCellWrapper>
          <IconButton onClick={() => setOpen(documentId ?? '')}>
            <Visibility height="30px" />
          </IconButton>

          <DocumentViewer
            deidentified={deidentified ?? false}
            open={open === documentId}
            handleClose={() => setOpen(null)}
            documentId={documentId ?? ''}
          />
        </TableCellWrapper>
      </TableRow>

      {documentContent && searchMode && (
        <TableRow className={classes.tableBodyRows}>
          <TableCellWrapper
            align="left"
            colSpan={6}
            style={{ backgroundImage: `url(${Watermark})`, backgroundSize: 'contain' }}
          >
            <Typography>{Parse(DOMPurify.sanitize(documentContent))}</Typography>
          </TableCellWrapper>
        </TableRow>
      )}
    </React.Fragment>
  )
}

const getStatusChip = (type?: DocumentReference['docStatus']) => {
  switch (type) {
    case DocumentStatuses.PRELIMINARY:
      return (
        <StatusChip
          status={ChipStyles.CANCELLED}
          icon={<CancelIcon height="15px" fill="#FFF" />}
          label={getDocumentStatus(type)}
        />
      )
    case DocumentStatuses.FINAL:
      return <StatusChip icon={<CheckIcon height="15px" fill="#FFF" />} label={getDocumentStatus(type)} />
    default:
      return ''
  }
}

export default DataTableComposition
