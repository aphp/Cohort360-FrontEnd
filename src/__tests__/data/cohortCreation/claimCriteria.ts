import { GhmDataType, Comparators, CriteriaType } from 'types/requestCriterias'

export const defaultClaimCriteria: GhmDataType = {
  id: 1,
  type: CriteriaType.CLAIM,
  isInclusive: true,
  title: 'Claim',
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
  label: undefined,
  encounterService: undefined
}

export const completeClaimCriteria: GhmDataType = {
  ...defaultClaimCriteria,
  occurrence: 1,
  occurrenceComparator: Comparators.GREATER,
  startOccurrence: ['2024-09-03', '2024-09-04'],
  encounterStartDate: ['2024-09-04', '2024-09-07'],
  includeEncounterStartDateNull: true,
  encounterEndDate: ['2024-09-02', '2024-09-06'],
  includeEncounterEndDateNull: false,
  encounterStatus: [{ id: 'cancelled', label: 'Cancelled', system: 'http://hl7.org/fhir/CodeSystem/encounter-status' }],
  code: [
    {
      id: '05C021',
      label: '05C021 - Chirurgie De Remplacement Valvulaire Avec…thétérisme Cardiaque Ou Coronarographie, Niveau 1',
      system: 'https://terminology.eds.aphp.fr/aphp-orbis-ghm'
    },

    {
      id: '05C022',
      label: '05C022 - Chirurgie De Remplacement Valvulaire Avec…thétérisme Cardiaque Ou Coronarographie, Niveau 2',
      system: 'https://terminology.eds.aphp.fr/aphp-orbis-ghm'
    },

    {
      id: '05C023',
      label: '05C023 - Chirurgie De Remplacement Valvulaire Avec…thétérisme Cardiaque Ou Coronarographie, Niveau 3',
      system: 'https://terminology.eds.aphp.fr/aphp-orbis-ghm'
    },

    {
      id: '05C024',
      label: '05C024 - Chirurgie De Remplacement Valvulaire Avec…thétérisme Cardiaque Ou Coronarographie, Niveau 4',
      system: 'https://terminology.eds.aphp.fr/aphp-orbis-ghm'
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
      label: 'GH RCP',
      name: 'GH RCP',
      parent_id: '8312002244',
      source_value: 'H01',
      status: undefined,
      subItems: undefined,
      type: 'Groupe hospitalier (GH)',
      system: 'nan'
    }
  ]
}
