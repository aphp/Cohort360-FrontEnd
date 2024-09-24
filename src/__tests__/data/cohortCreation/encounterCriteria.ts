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
  encounterStatus: [
    {
      id: 'status1',
      label: 'status1'
    },
    {
      id: 'status2',
      label: 'status2'
    }
  ],
  age: { start: '3/2/1', end: '3/2/1' },
  duration: { start: '6/5/4', end: '6/5/4' },
  admissionMode: [
    {
      id: 'mode1',
      label: 'mode1'
    },
    {
      id: 'mode2',
      label: 'mode2'
    }
  ],
  entryMode: [
    {
      id: 'entry1',
      label: 'entry1'
    },
    {
      id: 'entry2',
      label: 'entry2'
    }
  ],
  exitMode: [
    {
      id: 'exit1',
      label: 'exit1'
    },
    {
      id: 'exit2',
      label: 'exit2'
    }
  ],
  priseEnChargeType: [
    {
      id: 'prise1',
      label: 'prise1'
    },
    {
      id: 'prise2',
      label: 'prise2'
    }
  ],
  typeDeSejour: [
    {
      id: 'sejour1',
      label: 'sejour1'
    },
    {
      id: 'sejour2',
      label: 'sejour2'
    }
  ],
  reason: [
    {
      id: 'reason1',
      label: 'reason1'
    },
    {
      id: 'reason2',
      label: 'reason2'
    }
  ],
  destination: [
    {
      id: 'destination1',
      label: 'destination1'
    },
    {
      id: 'destination2',
      label: 'destination2'
    }
  ],
  provenance: [
    {
      id: 'provenance1',
      label: 'provenance1'
    },
    {
      id: 'provenance2',
      label: 'provenance2'
    }
  ],
  admission: [
    {
      id: 'admission1',
      label: 'admission1'
    },
    {
      id: 'admission2',
      label: 'admission2'
    }
  ],
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
