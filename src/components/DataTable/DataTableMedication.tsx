import React, { useState } from 'react'

import { CircularProgress, Grid, IconButton, Typography, TableRow } from '@mui/material'
import { TableCellWrapper } from 'components/ui/TableCell/styles'

import CommentIcon from '@mui/icons-material/Comment'

import DataTable from 'components/DataTable/DataTable'
import ModalAdministrationComment from 'components/Patient/PatientMedication/ModalAdministrationComment/ModalAdministrationComment'

import displayDigit from 'utils/displayDigit'

import { Column, CohortMedication } from 'types'

import useStyles from './styles'
import { MedicationAdministration, MedicationRequest } from 'fhir/r4'
import { OrderBy } from 'types/searchCriterias'

type DataTableMedicationProps = {
  loading: boolean
  deidentified: boolean
  selectedTab: 'prescription' | 'administration'
  medicationsList: CohortMedication<MedicationRequest | MedicationAdministration>[]
  orderBy?: OrderBy
  setOrderBy?: (order: OrderBy) => void
  page?: number
  setPage?: (page: number) => void
  total?: number
}
const DataTableMedication: React.FC<DataTableMedicationProps> = ({
  loading,
  deidentified,
  selectedTab,
  medicationsList,
  orderBy,
  setOrderBy,
  page,
  setPage,
  total
}) => {
  const { classes } = useStyles()

  const columns = [
    { label: `NDA${deidentified ? ' chiffré' : ''}`, code: 'encounter' },
    {
      label: selectedTab === 'prescription' ? 'Date de prescription' : "Date d'administration",
      code: 'Period-start'
    },
    { label: 'Code ATC', code: 'medication-atc' },
    { label: 'Code UCD', code: 'medication-ucd' },
    selectedTab === 'prescription' ? { label: 'Type de prescription', code: 'type' } : null,
    { label: "Voie d'administration", code: 'route' },
    selectedTab === 'administration' ? { label: 'Quantité' } : null,
    { label: 'Unité exécutrice' },
    selectedTab === 'administration' ? { label: 'Commentaire' } : null
  ].filter((elem) => elem !== null) as Column[]

  return (
    <DataTable columns={columns} order={orderBy} setOrder={setOrderBy} page={page} setPage={setPage} total={total}>
      {!loading && medicationsList && medicationsList.length > 0 ? (
        <>
          {medicationsList.map((medication) => {
            return <DataTableMedicationLine key={medication.id} deidentified={deidentified} medication={medication} />
          })}
        </>
      ) : (
        <TableRow className={classes.emptyTableRow}>
          <TableCellWrapper colSpan={8} align="left">
            <Grid container justifyContent="center">
              {loading ? (
                <CircularProgress />
              ) : (
                <Typography variant="button">{`Aucune ${
                  selectedTab === 'prescription' ? 'prescription' : 'administration'
                } à afficher`}</Typography>
              )}
            </Grid>
          </TableCellWrapper>
        </TableRow>
      )}
    </DataTable>
  )
}

const DataTableMedicationLine: React.FC<{
  medication: CohortMedication<MedicationRequest | MedicationAdministration>
  deidentified: boolean
}> = ({ medication, deidentified }) => {
  const { classes } = useStyles()

  const [open, setOpen] = useState<string | null>(null)

  const nda = medication.NDA
  const date =
    medication.resourceType === 'MedicationRequest'
      ? medication.dispenseRequest?.validityPeriod?.start
      : medication.effectivePeriod?.start
  const codeATC =
    medication.resourceType === 'MedicationRequest' ? medication.category?.[0]?.id : medication.category?.id
  const displayATC =
    medication.resourceType === 'MedicationRequest' ? medication.category?.[0]?.text : medication.category?.text

  // @ts-ignore
  const codeUCD = medication.contained?.[0]?.code?.coding?.[0]?.id
  // @ts-ignore
  const displayUCD = medication.contained?.[0]?.code?.coding?.[0]?.display

  const prescriptionType =
    medication.resourceType === 'MedicationRequest' &&
    (medication.extension?.find((extension) => extension.url === 'type') || {}).valueString
  const administrationRoute =
    medication.resourceType === 'MedicationRequest'
      ? medication.dosageInstruction?.[0]?.route?.text
      : medication.dosage?.route?.coding?.[0]?.display
  const dose = medication.resourceType === 'MedicationAdministration' && displayDigit(medication?.dosage?.dose?.value)
  const unit = medication.resourceType === 'MedicationAdministration' && medication.dosage?.dose?.unit
  const serviceProvider = medication.serviceProvider

  const comment = medication.resourceType === 'MedicationAdministration' ? medication.dosage?.text : null

  return (
    <TableRow className={classes.tableBodyRows} key={medication.id}>
      <TableCellWrapper align="left">{nda ?? 'Inconnu'}</TableCellWrapper>
      <TableCellWrapper>{date ? new Date(date).toLocaleDateString('fr-FR') : 'Date inconnue'}</TableCellWrapper>
      <TableCellWrapper>
        <Typography>{codeATC === 'No matching concept' || codeATC === 'Non Renseigné' ? '' : codeATC ?? ''}</Typography>
        <Typography className={classes.libelle}>
          {displayATC === 'No matching concept' ? '-' : displayATC ?? '-'}
        </Typography>
      </TableCellWrapper>
      <TableCellWrapper>
        <Typography>{codeUCD === 'No matching concept' || codeUCD === 'Non Renseigné' ? '' : codeUCD ?? ''}</Typography>
        <Typography className={classes.libelle}>
          {displayUCD === 'No matching concept' ? '-' : displayUCD ?? '-'}
        </Typography>
      </TableCellWrapper>
      {medication.resourceType === 'MedicationRequest' && (
        <TableCellWrapper>{prescriptionType ?? '-'}</TableCellWrapper>
      )}
      <TableCellWrapper>
        {administrationRoute === 'No matching concept' ? '-' : administrationRoute ?? '-'}
      </TableCellWrapper>
      {medication.resourceType === 'MedicationAdministration' && (
        <TableCellWrapper>
          {unit !== 'Non Renseigné' ? (
            <>
              {dose} {unit}
            </>
          ) : (
            '-'
          )}
        </TableCellWrapper>
      )}
      <TableCellWrapper>{serviceProvider ?? '-'}</TableCellWrapper>
      {medication.resourceType === 'MedicationAdministration' && deidentified === false && (
        <>
          <TableCellWrapper>
            <IconButton onClick={() => setOpen(comment ?? '')}>
              <CommentIcon />
            </IconButton>
          </TableCellWrapper>
          <ModalAdministrationComment open={open !== null} comment={open ?? ''} handleClose={() => setOpen(null)} />
        </>
      )}
    </TableRow>
  )
}

export default DataTableMedication
