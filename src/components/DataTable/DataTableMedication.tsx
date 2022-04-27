import React, { useState } from 'react'

import { CircularProgress, Grid, IconButton, Typography, TableRow, TableCell } from '@material-ui/core'

import CommentIcon from '@material-ui/icons/Comment'

import DataTable from 'components/DataTable/DataTable'
import ModalAdministrationComment from 'components/Patient/PatientMedication/ModalAdministrationComment/ModalAdministrationComment'

import displayDigit from 'utils/displayDigit'

import { Column, Order, CohortMedication } from 'types'
import { IMedicationRequest, IMedicationAdministration } from '@ahryman40k/ts-fhir-types/lib/R4'

import useStyles from './styles'

type DataTableMedicationProps = {
  loading: boolean
  deidentified: boolean
  selectedTab: 'prescription' | 'administration'
  medicationsList: CohortMedication<IMedicationRequest | IMedicationAdministration>[]
  order?: Order
  setOrder?: (order: Order) => void
  page?: number
  setPage?: (page: number) => void
  total?: number
}
const DataTableMedication: React.FC<DataTableMedicationProps> = ({
  loading,
  deidentified,
  selectedTab,
  medicationsList,
  order,
  setOrder,
  page,
  setPage,
  total
}) => {
  const classes = useStyles()

  const columns = [
    {
      label: `NDA${deidentified ? ' chiffré' : ''}`,
      code: 'encounter',
      align: 'center',
      sortableColumn: true
    },
    {
      label: selectedTab === 'prescription' ? 'Date de prescription' : "Date d'administration",
      code: 'Period-start',
      align: 'center',
      sortableColumn: true
    },
    { label: 'Code ATC', code: 'class-simple', align: 'center', sortableColumn: true },
    { label: 'Code UCD', code: 'code', align: 'center', sortableColumn: true },
    selectedTab === 'prescription'
      ? { label: 'Type de prescription', code: 'type', align: 'center', sortableColumn: true }
      : null,
    { label: "Voie d'administration", code: 'route', align: 'center', sortableColumn: true },
    selectedTab === 'administration' ? { label: 'Quantité', code: '', align: 'center', sortableColumn: false } : null,
    { label: 'Unité exécutrice', code: '', align: 'center', sortableColumn: true },
    selectedTab === 'administration' ? { label: 'Commentaire', code: '', align: 'center', sortableColumn: false } : null
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
      {!loading && medicationsList && medicationsList.length > 0 ? (
        <>
          {medicationsList.map((medication) => {
            return <DataTableMedicationLine key={medication.id} deidentified={deidentified} medication={medication} />
          })}
        </>
      ) : (
        <TableRow className={classes.emptyTableRow}>
          <TableCell colSpan={8} align="left">
            <Grid container justifyContent="center">
              {loading ? (
                <CircularProgress />
              ) : (
                <Typography variant="button">{`Aucune ${
                  selectedTab === 'prescription' ? 'prescription' : 'administration'
                } à afficher`}</Typography>
              )}
            </Grid>
          </TableCell>
        </TableRow>
      )}
    </DataTable>
  )
}

const DataTableMedicationLine: React.FC<{
  medication: CohortMedication<IMedicationRequest | IMedicationAdministration>
  deidentified: boolean
}> = ({ medication, deidentified }) => {
  const classes = useStyles()

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
    (medication.extension?.find((extension: any) => extension.url === 'type') || {}).valueString
  const administrationRoute =
    medication.resourceType === 'MedicationRequest'
      ? medication.dosageInstruction?.[0]?.route?.text
      : medication.dosage?.route?.coding?.[0]?.display
  const dose =
    medication.resourceType === 'MedicationAdministration' && displayDigit(+(medication?.dosage?.dose?.value ?? 0))
  const unit = medication.resourceType === 'MedicationAdministration' && medication.dosage?.dose?.unit
  const serviceProvider = medication.serviceProvider

  const comment = medication.resourceType === 'MedicationAdministration' ? medication.dosage?.text : null

  return (
    <TableRow className={classes.tableBodyRows} key={medication.id}>
      <TableCell align="left">{nda ?? 'Inconnu'}</TableCell>
      <TableCell align="center">{date ? new Date(date).toLocaleDateString('fr-FR') : 'Date inconnue'}</TableCell>
      <TableCell align="center">
        <Typography>{codeATC === 'No matching concept' || codeATC === 'Non Renseigné' ? '' : codeATC ?? ''}</Typography>
        <Typography className={classes.libelle}>
          {displayATC === 'No matching concept' ? '-' : displayATC ?? '-'}
        </Typography>
      </TableCell>
      <TableCell align="center">
        <Typography>{codeUCD === 'No matching concept' || codeUCD === 'Non Renseigné' ? '' : codeUCD ?? ''}</Typography>
        <Typography className={classes.libelle}>
          {displayUCD === 'No matching concept' ? '-' : displayUCD ?? '-'}
        </Typography>
      </TableCell>
      {medication.resourceType === 'MedicationRequest' && (
        <TableCell align="center">{prescriptionType ?? '-'}</TableCell>
      )}
      <TableCell align="center">
        {administrationRoute === 'No matching concept' ? '-' : administrationRoute ?? '-'}
      </TableCell>
      {medication.resourceType === 'MedicationAdministration' && (
        <TableCell align="center">
          {unit !== 'Non Renseigné' ? (
            <>
              {dose} {unit}
            </>
          ) : (
            '-'
          )}
        </TableCell>
      )}
      <TableCell align="center">{serviceProvider ?? '-'}</TableCell>
      {medication.resourceType === 'MedicationAdministration' && deidentified === false && (
        <>
          <TableCell align="center">
            <IconButton onClick={() => setOpen(comment ?? '')}>
              <CommentIcon />
            </IconButton>
          </TableCell>
          <ModalAdministrationComment open={open !== null} comment={open ?? ''} handleClose={() => setOpen(null)} />
        </>
      )}
    </TableRow>
  )
}

export default DataTableMedication
