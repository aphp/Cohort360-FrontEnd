import React, { useState } from 'react'
import { useHistory } from 'react-router-dom'
import clsx from 'clsx'

import {
  Chip,
  CircularProgress,
  Grid,
  IconButton,
  Paper,
  Typography,
  TableContainer,
  Table,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
  TableSortLabel
} from '@material-ui/core'

import FolderSharedIcon from '@material-ui/icons/FolderShared'
import DescriptionIcon from '@material-ui/icons/Description'
import LocalHospitalIcon from '@material-ui/icons/LocalHospital'
import { ReactComponent as PdfIcon } from 'assets/icones/file-pdf.svg'
import { ReactComponent as CheckIcon } from 'assets/icones/check.svg'
import { ReactComponent as CancelIcon } from 'assets/icones/times.svg'
import { ReactComponent as UserIcon } from 'assets/icones/user.svg'
import { ReactComponent as SearchIcon } from 'assets/icones/search.svg'

import { CohortComposition } from 'types'
import {
  CompositionStatusKind,
  DocumentReferenceStatusKind,
  IEncounter,
  IDocumentReference
} from '@ahryman40k/ts-fhir-types/lib/R4'

import DocumentViewer from 'components/DocumentViewer/DocumentViewer'

// import { fetchDocumentContent } from 'services/cohortInfos'
import { getDocumentStatus } from 'utils/documentsFormatter'

import useStyles from './styles'

type DocumentRowTypes = {
  groupId?: string
  document: CohortComposition | IDocumentReference
  documentEncounter?: IEncounter
  showText: boolean
  showIpp?: boolean
  deidentified: boolean | null
  backgroundColor: string
}
const DocumentRow: React.FC<DocumentRowTypes> = ({
  groupId,
  document,
  documentEncounter,
  showText,
  showIpp,
  deidentified,
  backgroundColor
}) => {
  const history = useHistory()
  const classes = useStyles()
  const [pdfDialogOpen, setDocumentDialogOpen] = useState(false)

  const getStatusShip = (type?: CompositionStatusKind | DocumentReferenceStatusKind) => {
    if (type === 'final' || type === 'current') {
      return (
        <Chip
          className={classes.validChip}
          icon={<CheckIcon height="15px" fill="#FFF" />}
          label={getDocumentStatus(type)}
        />
      )
    } else if (type === 'entered-in-error') {
      return (
        <Chip
          className={classes.cancelledChip}
          icon={<CancelIcon height="15px" fill="#FFF" />}
          label={getDocumentStatus(type)}
        />
      )
    } else {
      return ''
    }
  }

  const row = {
    ...document,
    title: document.resourceType === 'Composition' ? document.title : document.description ?? '-',
    IPP:
      document.resourceType === 'Composition' ? document.IPP ?? 'inconnu' : document.subject?.identifier?.value ?? '-',
    idPatient:
      document.resourceType === 'Composition' ? document.idPatient : document.subject?.reference?.split('/')[1] ?? '-',
    NDA:
      document.resourceType === 'Composition'
        ? document.NDA ?? 'inconnu'
        : document.context?.encounter?.[0].identifier?.value ?? '-',
    serviceProvider:
      document.resourceType === 'Composition'
        ? document.serviceProvider ?? 'non renseigné'
        : documentEncounter?.serviceProvider?.display ?? '-',
    docType:
      document.resourceType === 'Composition' ? (document?.type?.coding ? document.type.coding[0].display : '-') : '-',
    section: document.resourceType === 'Composition' ? document.section : []
  }
  const date = row.date ? new Date(row.date).toLocaleDateString('fr-FR') : ''
  const hour = row.date
    ? new Date(row.date).toLocaleTimeString('fr-FR', {
        hour: '2-digit',
        minute: '2-digit'
      })
    : ''

  return (
    <>
      <TableRow style={{ backgroundColor }}>
        <TableCell>
          <Typography variant="button">{row.title ?? 'Document sans titre'}</Typography>
          <Typography>
            {date} {hour}
          </Typography>
          {getStatusShip(row.status)}
        </TableCell>

        {showIpp && (
          <TableCell>
            <Grid container alignItems="center" wrap="nowrap">
              <UserIcon height="25px" fill="#5BC5F2" className={classes.iconMargin} />
              {deidentified ? <Typography>{row.idPatient}</Typography> : <Typography>{row.IPP}</Typography>}
              <IconButton
                onClick={() => history.push(`/patients/${row.idPatient}${groupId ? `?groupId=${groupId}` : ''}`)}
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
            <Typography>{row.NDA}</Typography>
          </Grid>
        </TableCell>

        <TableCell>
          <Grid container alignItems="center" wrap="nowrap">
            <LocalHospitalIcon htmlColor="#5BC5F2" className={clsx(classes.iconSize, classes.iconMargin)} />
            <Typography>{row.serviceProvider}</Typography>
          </Grid>
        </TableCell>

        <TableCell>
          <Grid container alignItems="center" wrap="nowrap">
            <DescriptionIcon htmlColor="#5BC5F2" className={clsx(classes.iconSize, classes.iconMargin)} />
            <Typography>{row.docType}</Typography>
          </Grid>
        </TableCell>

        <TableCell>
          <IconButton onClick={() => setDocumentDialogOpen(true)}>
            <PdfIcon height="30px" fill="#ED6D91" />
          </IconButton>

          <DocumentViewer
            deidentified={deidentified ?? false}
            open={pdfDialogOpen}
            handleClose={() => setDocumentDialogOpen(false)}
            documentId={row.id ?? ''}
            list={groupId ? groupId.split(',') : undefined}
          />
        </TableCell>
      </TableRow>

      {showText && (
        <TableRow style={{ backgroundColor }}>
          <TableCell colSpan={6}>
            {row.section?.map((section) => (
              <Grid key={section.title} container item direction="column">
                <Typography variant="h6">{section.title}</Typography>
                <Typography dangerouslySetInnerHTML={{ __html: section.text?.div ?? '' }} />
              </Grid>
            ))}
          </TableCell>
        </TableRow>
      )}
    </>
  )
}

type DocumentTableTypes = {
  groupId?: string
  loading: boolean
  documents?: (CohortComposition | IDocumentReference)[]
  encounters?: IEncounter[]
  searchMode: boolean
  showIpp?: boolean
  deidentified: boolean | null
  sortBy?: string
  onChangeSortBy?: (_sortBy: string) => void
  sortDirection: 'asc' | 'desc'
  onChangeSortDirection?: (_sortDirection: 'asc' | 'desc') => void
}
const DocumentTable: React.FC<DocumentTableTypes> = React.memo(
  ({
    groupId,
    loading,
    documents,
    searchMode,
    showIpp,
    encounters,
    deidentified,
    sortBy,
    onChangeSortBy,
    sortDirection,
    onChangeSortDirection
  }) => {
    const classes = useStyles()

    const handleRequestSort = (property: string) => {
      const isAsc = sortBy === property && sortDirection === 'desc'
      if (onChangeSortDirection && typeof onChangeSortDirection === 'function') {
        onChangeSortDirection(isAsc ? 'asc' : 'desc')
      }
      if (onChangeSortBy && typeof onChangeSortBy === 'function') {
        onChangeSortBy(property)
      }
    }

    return loading ? (
      <CircularProgress className={classes.loadingSpinner} size={50} />
    ) : (
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow className={classes.tableHead}>
              <TableCell align="center" className={classes.tableHeadCell}>
                <Typography variant="button" style={{ fontSize: 11, textTransform: 'uppercase' }}>
                  Nom /
                  <TableSortLabel
                    style={{ marginLeft: 4, marginTop: -4 }}
                    active={sortBy === 'date'}
                    direction={sortDirection || 'asc'}
                    onClick={() => handleRequestSort('date')}
                  >
                    Date
                  </TableSortLabel>
                </Typography>
              </TableCell>
              {showIpp && (
                <TableCell align="center" className={classes.tableHeadCell}>
                  <Grid container alignItems="center" justify="center">
                    {deidentified ? (
                      <Typography style={{ marginLeft: 4, fontSize: 11, textTransform: 'uppercase' }} variant="button">
                        IPP chiffré
                      </Typography>
                    ) : (
                      <TableSortLabel
                        active={sortBy === 'patient'}
                        direction={sortDirection || 'asc'}
                        onClick={() => handleRequestSort('patient')}
                      >
                        IPP
                      </TableSortLabel>
                    )}
                  </Grid>
                </TableCell>
              )}
              <TableCell align="center" className={classes.tableHeadCell}>
                <Grid container alignItems="center" justify="center">
                  <Typography style={{ marginLeft: 4, fontSize: 11, textTransform: 'uppercase' }} variant="button">
                    {deidentified ? 'NDA chiffré' : 'NDA'}
                  </Typography>
                </Grid>
              </TableCell>
              <TableCell align="center" className={classes.tableHeadCell}>
                <Grid container alignItems="center" justify="center">
                  <Typography style={{ marginLeft: 4, fontSize: 11, textTransform: 'uppercase' }} variant="button">
                    Unité exécutrice
                  </Typography>
                  {/* <TableSortLabel
                    active={sortBy === 'encounter.service-provider'}
                    direction={sortDirection || 'asc'}
                    onClick={() => handleRequestSort('encounter.service-provider')}
                  >
                  </TableSortLabel> */}
                </Grid>
              </TableCell>
              <TableCell align="center" className={classes.tableHeadCell}>
                <Grid container alignItems="center" justify="center">
                  <TableSortLabel
                    active={sortBy === 'type'}
                    direction={sortDirection || 'asc'}
                    onClick={() => handleRequestSort('type')}
                  >
                    Type de document
                  </TableSortLabel>
                </Grid>
              </TableCell>
              <TableCell align="center" className={classes.tableHeadCell}>
                <Grid container alignItems="center" justify="center">
                  <Typography style={{ marginLeft: 4, fontSize: 11, textTransform: 'uppercase' }} variant="button">
                    Aperçu
                  </Typography>
                </Grid>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {documents && documents.length > 0 ? (
              documents.map((row, index) => {
                let relatedEncounter: IEncounter | undefined = undefined
                if (row.resourceType === 'DocumentReference') {
                  relatedEncounter = encounters
                    ? encounters.find(
                        (encounter) => encounter.id === row.context?.encounter?.[0].reference?.split('/')[1]
                      )
                    : undefined
                }
                return (
                  <DocumentRow
                    key={row.id}
                    groupId={groupId}
                    document={row}
                    showText={searchMode}
                    showIpp={showIpp}
                    documentEncounter={relatedEncounter}
                    deidentified={deidentified}
                    backgroundColor={index % 2 === 0 ? '#faf9f9' : '#fff'}
                  />
                )
              })
            ) : (
              <TableRow>
                <TableCell colSpan={6}>
                  <Grid container justify="center">
                    <Typography variant="button"> Aucun document à afficher </Typography>
                  </Grid>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    )
  }
)

export default DocumentTable
