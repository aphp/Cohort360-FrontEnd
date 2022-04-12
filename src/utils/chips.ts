import moment from 'moment'

import { getDisplayingSelectedDocTypes } from 'utils/documentsFormatter'
import { genderName, vitalStatusName } from 'utils/patient'
import { ageName } from 'utils/age'

import { DocumentFilters, PatientFilters as PatientFiltersType } from 'types'

export const buildDocumentFiltersChips = (
  filters: DocumentFilters,
  handleDeleteChip: (filterName: 'nda' | 'ipp' | 'selectedDocTypes' | 'startDate' | 'endDate', value?: string) => void
) => {
  const displayingSelectedDocType: any[] = getDisplayingSelectedDocTypes(filters.selectedDocTypes)

  return (
    [
      filters.nda &&
        filters.nda.split(',').map((nda) => ({ label: nda ? nda : '', onDelete: () => handleDeleteChip('nda', nda) })),
      filters.ipp &&
        filters.ipp.split(',').map((ipp) => ({ label: ipp ? ipp : '', onDelete: () => handleDeleteChip('ipp', ipp) })),
      displayingSelectedDocType &&
        displayingSelectedDocType.map((docType) => ({
          label: docType.label ? docType.label : '',
          onDelete: () => handleDeleteChip('selectedDocTypes', docType.label)
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
      .filter((chip) => chip.label) as {
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
  ].filter((chip) => chip.label) as {
    label: string
    onDelete?: (args: any) => void
  }[]
}
