import {
  MedicationDataType,
  form
} from 'components/CreationCohort/DiagramView/components/LogicalOperator/components/CriteriaRightPanel/forms/MedicationForm'
import { Comparators, CriteriaType } from 'types/requestCriterias'

export const defaultMedicationCriteria: MedicationDataType = {
  id: 1,
  ...form().initialData,
  type: CriteriaType.MEDICATION_ADMINISTRATION
}

export const completeMedicationAdministrationCriteria: MedicationDataType = {
  ...defaultMedicationCriteria,
  type: CriteriaType.MEDICATION_ADMINISTRATION,
  occurrence: { value: 1, comparator: Comparators.GREATER },
  startOccurrence: { start: '2024-09-03', end: '2024-09-04' },
  encounterStartDate: { start: '2024-09-04', end: '2024-09-07', includeNull: true },
  encounterEndDate: { start: '2024-09-02', end: '2024-09-06' },
  encounterStatus: [{ id: 'cancelled', label: 'Cancelled', system: 'http://hl7.org/fhir/CodeSystem/encounter-status' }],
  code: [
    { id: 'D01AA01', label: 'D01AA01 - Nystatin; Topical', system: 'https://terminology.eds.aphp.fr/atc' },
    { id: 'D01AA02', label: 'D01AA02 - Natamycin; Topical', system: 'https://terminology.eds.aphp.fr/atc' },
    {
      id: '3400890000055',
      label: '3400890000055 - Sawis 2mg Cpr',
      system: 'https://terminology.eds.aphp.fr/smt-medicament-ucd'
    }
  ],
  administration: [
    {
      id: 'CUTAN',
      label: 'Cutanée',
      system: 'https://terminology.eds.aphp.fr/aphp-orbis-medicament-voie-administration'
    }
  ],
  encounterService: [
    {
      above_levels_ids: '8312002244',
      cohort_id: '6935',
      cohort_size: '23',
      full_path: 'APHP-ASSISTANCE PUBLIQUE AP-HP/H01-GH RCP',
      id: '8312016825',
      inferior_levels_ids: '8312016826',
      name: 'GH RCP',
      parent_id: '8312002244',
      source_value: 'H01',
      status: undefined,
      subItems: undefined,
      type: 'Groupe hospitalier (GH)'
    }
  ]
}

export const completeMedicationPrescriptionCriteria: MedicationDataType = {
  ...defaultMedicationCriteria,
  type: CriteriaType.MEDICATION_REQUEST,
  occurrence: { value: 1, comparator: Comparators.GREATER },
  startOccurrence: { start: '2024-09-03', end: '2024-09-04' },
  encounterStartDate: { start: '2024-09-04', end: '2024-09-07', includeNull: true },
  encounterEndDate: { start: '2024-09-02', end: '2024-09-06' },
  encounterStatus: [{ id: 'cancelled', label: 'Cancelled', system: 'http://hl7.org/fhir/CodeSystem/encounter-status' }],
  code: [
    { id: 'D01AA01', label: 'D01AA01 - Nystatin; Topical', system: 'https://terminology.eds.aphp.fr/atc' },
    { id: 'D01AA02', label: 'D01AA02 - Natamycin; Topical', system: 'https://terminology.eds.aphp.fr/atc' },
    {
      id: '3400890000055',
      label: '3400890000055 - Sawis 2mg Cpr',
      system: 'https://terminology.eds.aphp.fr/smt-medicament-ucd'
    }
  ],
  prescriptionType: [
    {
      id: '172641',
      label: 'Prescription Hospitalière',
      system: 'https://terminology.eds.aphp.fr/aphp-medicament-type-prescription'
    }
  ],
  encounterService: [
    {
      above_levels_ids: '8312002244',
      cohort_id: '6935',
      cohort_size: '23',
      full_path: 'APHP-ASSISTANCE PUBLIQUE AP-HP/H01-GH RCP',
      id: '8312016825',
      inferior_levels_ids: '8312016826',
      name: 'GH RCP',
      parent_id: '8312002244',
      source_value: 'H01',
      status: undefined,
      subItems: undefined,
      type: 'Groupe hospitalier (GH)'
    }
  ]
}
