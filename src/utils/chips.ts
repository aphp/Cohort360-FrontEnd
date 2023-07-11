import moment from 'moment'

import { capitalizeFirstLetter } from 'utils/capitalize'
import { getDisplayingSelectedDocTypes } from 'utils/documentsFormatter'
import { genderName, vitalStatusName } from 'utils/patient'
import { ageName } from 'utils/age'

import {
  DocumentFilters as DocumentFiltersType,
  PatientFilters as PatientFiltersType,
  ObservationFilters as ObservationFiltersType,
  MedicationsFilters as MedicationFiltersType,
  PMSIFilters as PMSIFiltersType,
  CohortFilters as CohortFiltersType
} from 'types'
import { MasterChipsProps } from 'components/MasterChips/MasterChips'

export const buildDocumentFiltersChips = (
  filters: DocumentFiltersType,
  handleDeleteChip: (filterName: 'nda' | 'ipp' | 'selectedDocTypes' | 'startDate' | 'endDate', value?: string) => void
): MasterChipsProps['chips'] => {
  const displayingSelectedDocType: any[] = getDisplayingSelectedDocTypes(filters.selectedDocTypes)

  return (
    [
      !!filters.nda &&
        filters.nda.split(',').map((nda) => ({
          label: nda ? `NDA : ${nda}` : '',
          onDelete: () =>
            handleDeleteChip(
              'nda',
              filters.nda
                .split(',')
                .filter((elem) => elem !== nda)
                .join(',')
            )
        })),
      !!filters.ipp &&
        filters.ipp
          .split(',')
          .map((ipp) => ({ label: ipp ? `IPP : ${ipp}` : '', onDelete: () => handleDeleteChip('ipp', ipp) })),
      displayingSelectedDocType?.length > 0 &&
        displayingSelectedDocType.map((docType) => ({
          label: docType?.label ? docType?.label : '',
          onDelete: () => handleDeleteChip('selectedDocTypes', docType?.label)
        })),
      {
        label: filters.startDate ? `Après le : ${moment(filters.startDate).format('DD/MM/YYYY')}` : '',
        onDelete: () => handleDeleteChip('startDate')
      },
      {
        label: filters.endDate ? `Avant le : ${moment(filters.endDate).format('DD/MM/YYYY')}` : '',
        onDelete: () => handleDeleteChip('endDate')
      }
    ]
      .flat()
      // @ts-ignore
      .filter((chip) => chip?.label) as MasterChipsProps['chips']
  )
}

export const buildPatientFiltersChips = (
  filters: PatientFiltersType,
  handleDeleteChip: (filterName: 'gender' | 'birthdates' | 'vitalStatus') => void
): MasterChipsProps['chips'] => {
  const gender = genderName(filters.gender)
  const birthdates = ageName(filters.birthdatesRanges)
  const vitalStatus = vitalStatusName(filters.vitalStatus)

  return [
    { label: gender ? gender : '', onDelete: () => handleDeleteChip('gender') },
    { label: birthdates ? birthdates : '', onDelete: () => handleDeleteChip('birthdates') },
    { label: vitalStatus ? vitalStatus : '', onDelete: () => handleDeleteChip('vitalStatus') }
  ].filter((chip) => chip?.label) as MasterChipsProps['chips']
}

export const buildObservationFiltersChips = (
  filters: ObservationFiltersType,
  handleDeleteChip: (filterName: 'nda' | 'loinc' | 'anabio' | 'startDate' | 'endDate', value?: any) => void
): MasterChipsProps['chips'] => {
  return (
    [
      filters.nda &&
        filters.nda.split(',').map((nda) => ({
          label: nda ? `NDA : ${nda}` : '',
          onDelete: () =>
            handleDeleteChip(
              'nda',
              filters.nda
                .split(',')
                .filter((elem) => elem !== nda)
                .join(',')
            )
        })),
      filters.loinc &&
        filters.loinc.split(',').map((loinc) => ({
          label: loinc ? `Code LOINC : ${loinc}` : '',
          onDelete: () =>
            handleDeleteChip(
              'loinc',
              filters.loinc
                .split(',')
                .filter((elem) => elem !== loinc)
                .join(',')
            )
        })),
      filters.anabio &&
        filters.anabio.split(',').map((anabio) => ({
          label: anabio ? `Code ANABIO : ${anabio}` : '',
          onDelete: () =>
            handleDeleteChip(
              'anabio',
              filters.anabio
                .split(',')
                .filter((elem) => elem !== anabio)
                .join(',')
            )
        })),
      {
        label: filters.startDate ? `Après le : ${moment(filters.startDate).format('DD/MM/YYYY')}` : '',
        onDelete: () => handleDeleteChip('startDate')
      },
      {
        label: filters.endDate ? `Avant le : ${moment(filters.endDate).format('DD/MM/YYYY')}` : '',
        onDelete: () => handleDeleteChip('endDate')
      }
    ]
      .flat()
      // @ts-ignore
      .filter((chip) => chip?.label) as MasterChipsProps['chips']
  )
}

export const buildMedicationFiltersChips = (
  filters: MedicationFiltersType,
  handleDeleteChip: (
    filterName: 'nda' | 'selectedPrescriptionTypes' | 'selectedAdministrationRoutes' | 'startDate' | 'endDate',
    value?: any
  ) => void
): MasterChipsProps['chips'] => {
  return (
    [
      filters.nda &&
        filters.nda.split(',').map((nda) => ({
          label: nda ? `NDA : ${nda}` : '',
          onDelete: () =>
            handleDeleteChip(
              'nda',
              filters.nda
                .split(',')
                .filter((elem) => elem !== nda)
                .join(',')
            )
        })),
      filters.selectedPrescriptionTypes?.length > 0 &&
        filters.selectedPrescriptionTypes.map(({ label, ...prescriptionType }) => ({
          label: label ? `Type de prescription : ${label}` : '',
          onDelete: () =>
            handleDeleteChip(
              'selectedPrescriptionTypes',
              filters.selectedPrescriptionTypes.filter(({ id }) => id !== prescriptionType.id)
            )
        })),
      filters.selectedAdministrationRoutes?.length > 0 &&
        filters.selectedAdministrationRoutes.map(({ label, ...administrationRoute }) => ({
          label: label ? `Voie d'admistration : ${label}` : '',
          onDelete: () =>
            handleDeleteChip(
              'selectedAdministrationRoutes',
              filters.selectedAdministrationRoutes.filter(({ id }) => id !== administrationRoute.id)
            )
        })),
      {
        label: filters.startDate ? `Après le : ${moment(filters.startDate).format('DD/MM/YYYY')}` : '',
        onDelete: () => handleDeleteChip('startDate')
      },
      {
        label: filters.endDate ? `Avant le : ${moment(filters.endDate).format('DD/MM/YYYY')}` : '',
        onDelete: () => handleDeleteChip('endDate')
      }
    ]
      .flat()
      // @ts-ignore
      .filter((chip) => chip?.label) as MasterChipsProps['chips']
  )
}

export const buildPmsiFiltersChips = (
  filters: PMSIFiltersType,
  handleDeleteChip: (
    filterName: 'nda' | 'code' | 'selectedDiagnosticTypes' | 'startDate' | 'endDate',
    value?: any
  ) => void
): MasterChipsProps['chips'] => {
  return (
    [
      filters.nda &&
        filters.nda.split(',').map((nda) => ({
          label: nda ? `NDA : ${nda}` : '',
          onDelete: () =>
            handleDeleteChip(
              'nda',
              filters.nda
                .split(',')
                .filter((elem) => elem !== nda)
                .join(',')
            )
        })),
      filters.code &&
        filters.code.split(',').map((code) => ({
          label: code ? `Code : ${code}` : '',
          onDelete: () =>
            handleDeleteChip(
              'code',
              filters.code
                .split(',')
                .filter((elem) => elem !== code)
                .join(',')
            )
        })),
      filters.selectedDiagnosticTypes?.length > 0 &&
        filters.selectedDiagnosticTypes.map(({ label, ...selectedDiagnosticType }) => ({
          label: label ? `Type : ${capitalizeFirstLetter(label)}` : '',
          onDelete: () => handleDeleteChip('selectedDiagnosticTypes', selectedDiagnosticType)
        })),
      {
        label: filters.startDate ? `Après le : ${moment(filters.startDate).format('DD/MM/YYYY')}` : '',
        onDelete: () => handleDeleteChip('startDate')
      },
      {
        label: filters.endDate ? `Avant le : ${moment(filters.endDate).format('DD/MM/YYYY')}` : '',
        onDelete: () => handleDeleteChip('endDate')
      }
    ]
      .flat()
      // @ts-ignore
      .filter((chip) => chip?.label) as MasterChipsProps['chips']
  )
}

export const buildCohortFiltersChips = (
  filters: CohortFiltersType,
  handleDeleteChip: (
    filterName: 'status' | 'favorite' | 'minPatients' | 'maxPatients' | 'startDate' | 'endDate',
    value?: any
  ) => void
): MasterChipsProps['chips'] => {
  return (
    [
      filters.status?.length > 0 &&
        filters.status.map(({ display, code }) => ({
          label: display ? `Statut : ${capitalizeFirstLetter(display)}` : '',
          onDelete: () => handleDeleteChip('status', { display, code })
        })),
      {
        label:
          filters.favorite && filters.favorite !== 'all'
            ? filters.favorite === 'True'
              ? 'Cohortes favorites'
              : 'Cohortes non favorites'
            : '',
        onDelete: () => handleDeleteChip('favorite')
      },
      {
        label: filters.minPatients ? `Au moins ${filters.minPatients} patients` : '',
        onDelete: () => handleDeleteChip('minPatients')
      },
      {
        label: filters.maxPatients ? `Jusque ${filters.maxPatients} patients` : '',
        onDelete: () => handleDeleteChip('maxPatients')
      },
      {
        label: filters.startDate ? `Après le : ${moment(filters.startDate).format('DD/MM/YYYY')}` : '',
        onDelete: () => handleDeleteChip('startDate')
      },
      {
        label: filters.endDate ? `Avant le : ${moment(filters.endDate).format('DD/MM/YYYY')}` : '',
        onDelete: () => handleDeleteChip('endDate')
      }
    ]
      .flat()
      // @ts-ignore
      .filter((chip) => chip?.label) as MasterChipsProps['chips']
  )
}
