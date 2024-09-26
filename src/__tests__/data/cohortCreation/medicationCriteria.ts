import { MedicationDataType, Comparators, CriteriaType } from 'types/requestCriterias'

export const defaultMedicationCriteria: MedicationDataType = {
  id: 1,
  type: CriteriaType.MEDICATION_ADMINISTRATION,
  isInclusive: true,
  title: 'Medciation',
  occurrence: null,
  occurrenceComparator: null,
  startOccurrence: [null, null],
  endOccurrence: [null, null],
  encounterStartDate: [null, null],
  includeEncounterStartDateNull: false,
  encounterEndDate: [null, null],
  includeEncounterEndDateNull: false,
  encounterStatus: [],
  code: [],
  administration: [],
  encounterService: []
}

export const completeMedicationAdministrationCriteria: MedicationDataType = {
  ...defaultMedicationCriteria,
  occurrence: 1,
  occurrenceComparator: Comparators.GREATER,
  startOccurrence: ['2024-09-03', '2024-09-04'],
  encounterStartDate: ['2024-09-04', '2024-09-07'],
  includeEncounterStartDateNull: true,
  encounterEndDate: ['2024-09-02', '2024-09-06'],
  includeEncounterEndDateNull: false,
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
  occurrence: 1,
  occurrenceComparator: Comparators.GREATER,
  startOccurrence: ['2024-09-03', '2024-09-04'],
  encounterStartDate: ['2024-09-04', '2024-09-07'],
  includeEncounterStartDateNull: true,
  encounterEndDate: ['2024-09-02', '2024-09-06'],
  includeEncounterEndDateNull: false,
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
