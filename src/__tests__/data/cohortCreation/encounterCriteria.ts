import {
  EncounterDataType,
  form
} from 'components/CreationCohort/DiagramView/components/LogicalOperator/components/CriteriaRightPanel/forms/EncounterForm'
import { Comparators } from 'types/requestCriterias'

export const defaultEncounterCriteira: EncounterDataType = {
  id: 1,
  ...form().initialData
}

export const completeEncounterCriteria: EncounterDataType = {
  ...defaultEncounterCriteira,
  occurrence: { value: 1, comparator: Comparators.GREATER },
  startOccurrence: null,
  encounterStartDate: { start: '2024-09-05', end: '2024-09-05', includeNull: true },
  encounterEndDate: { start: '2024-09-06', end: '2024-09-07', includeNull: true },
  encounterStatus: ['status1', 'status2'],
  age: { start: '3/2/1', end: '3/2/1' },
  duration: { start: '6/5/4', end: '6/5/4' },
  admissionMode: ['mode1', 'mode2'],
  entryMode: ['entry1', 'entry2'],
  exitMode: ['exit1', 'exit2'],
  priseEnChargeType: ['prise1', 'prise2'],
  typeDeSejour: ['sejour1', 'sejour2'],
  reason: ['reason1', 'reason2'],
  destination: ['destination1', 'destination2'],
  provenance: ['provenance1', 'provenance2'],
  admission: ['admission1', 'admission2'],
  encounterService: [
    {
      above_levels_ids: '',
      cohort_id: '118',
      cohort_size: '19215',
      full_path: 'APHP-ASSISTANCE PUBLIQUE AP-HP',
      id: '8312002244',
      inferior_levels_ids:
        '18057244581,8312016825,18042109751,18042109752,18057244580,18042109750,18042109755,18057244579,18042109754,18057244583,18057244578,18042109753,17497666686',
      name: 'ASSISTANCE PUBLIQUE AP-HP',
      parent_id: '',
      source_value: 'APHP',
      status: undefined,
      subItems: undefined,
      type: 'AP-HP'
    }
  ]
}
