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

export const buildDocumentFiltersChips = (
  filters: DocumentFiltersType,
  handleDeleteChip: (filterName: 'nda' | 'ipp' | 'selectedDocTypes' | 'startDate' | 'endDate', value?: string) => void
) => {
  const displayingSelectedDocType: any[] = getDisplayingSelectedDocTypes(filters.selectedDocTypes)

  return (
    [
      !!filters.nda &&
        filters.nda
          .split(',')
          .map((nda) => ({ label: nda ? `NDA : ${nda}` : '', onDelete: () => handleDeleteChip('nda', nda) })),
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
      .filter((chip) => chip?.label) as {
      label: string
      onDelete?: (args: any) => void
    }[]
  )
}

export const buildPatientFiltersChips = (
  filters: PatientFiltersType,
  handleDeleteChip: (filterName: 'gender' | 'birthdates' | 'vitalStatus') => void
) => {
  const gender = genderName(filters.gender)
  const birthdates = ageName(filters.birthdates)
  const vitalStatus = vitalStatusName(filters.vitalStatus)

  return [
    { label: gender ? gender : '', onDelete: () => handleDeleteChip('gender') },
    { label: birthdates ? birthdates : '', onDelete: () => handleDeleteChip('birthdates') },
    { label: vitalStatus ? vitalStatus : '', onDelete: () => handleDeleteChip('vitalStatus') }
  ].filter((chip) => chip?.label) as {
    label: string
    onDelete?: (args: any) => void
  }[]
}

export const buildObservationFiltersChips = (
  filters: ObservationFiltersType,
  handleDeleteChip: (filterName: 'nda' | 'loinc' | 'anabio' | 'startDate' | 'endDate', value?: any) => void
) => {
  return (
    [
      filters.nda &&
        filters.nda
          .split(',')
          .map((nda) => ({ label: nda ? `NDA : ${nda}` : '', onDelete: () => handleDeleteChip('nda', nda) })),
      filters.loinc &&
        filters.loinc.split(',').map((loinc) => ({
          label: loinc ? `Code LOINC : ${loinc}` : '',
          onDelete: () => handleDeleteChip('loinc', loinc)
        })),
      filters.anabio &&
        filters.anabio.split(',').map((anabio) => ({
          label: anabio ? `Code ANABIO : ${anabio}` : '',
          onDelete: () => handleDeleteChip('anabio', anabio)
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
      .filter((chip) => chip?.label) as {
      label: string
      onDelete?: (args: any) => void
    }[]
  )
}

export const buildMedicationFiltersChips = (
  filters: MedicationFiltersType,
  handleDeleteChip: (
    filterName: 'nda' | 'selectedPrescriptionTypes' | 'selectedAdministrationRoutes' | 'startDate' | 'endDate',
    value?: any
  ) => void
) => {
  return (
    [
      filters.nda &&
        filters.nda
          .split(',')
          .map((nda) => ({ label: nda ? `NDA : ${nda}` : '', onDelete: () => handleDeleteChip('nda', nda) })),
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
      .filter((chip) => chip?.label) as {
      label: string
      onDelete?: (args: any) => void
    }[]
  )
}

export const buildPmsiFiltersChips = (
  filters: PMSIFiltersType,
  handleDeleteChip: (
    filterName: 'nda' | 'code' | 'selectedDiagnosticTypes' | 'startDate' | 'endDate',
    value?: any
  ) => void
) => {
  return (
    [
      filters.nda &&
        filters.nda
          .split(',')
          .map((nda) => ({ label: nda ? `NDA : ${nda}` : '', onDelete: () => handleDeleteChip('nda', nda) })),
      filters.code &&
        filters.code
          .split(',')
          .map((code) => ({ label: code ? `Code : ${code}` : '', onDelete: () => handleDeleteChip('code', code) })),
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
      .filter((chip) => chip?.label) as {
      label: string
      onDelete?: (args: any) => void
    }[]
  )
}

export const buildCohortFiltersChips = (
  filters: CohortFiltersType,
  handleDeleteChip: (
    filterName: 'status' | 'type' | 'favorite' | 'minPatients' | 'maxPatients' | 'startDate' | 'endDate',
    value?: any
  ) => void
) => {
  return (
    [
      filters.status?.length > 0 &&
        filters.status.map(({ display, code }) => ({
          label: display ? `Statut : ${capitalizeFirstLetter(display)}` : '',
          onDelete: () => handleDeleteChip('status', { display, code })
        })),
      {
        label:
          filters.type && filters.type !== 'all'
            ? filters.type === 'IMPORT_I2B2'
              ? 'Cohorte I2B2'
              : 'Cohorte Cohort360'
            : '',
        onDelete: () => handleDeleteChip('type')
      },
      {
        label:
          filters.favorite && filters.favorite !== 'all'
            ? filters.favorite === 'True'
              ? 'Cohortes favories'
              : 'Cohortes non favories'
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
      .filter((chip) => chip?.label) as {
      label: string
      onDelete?: (args: any) => void
    }[]
  )
}
