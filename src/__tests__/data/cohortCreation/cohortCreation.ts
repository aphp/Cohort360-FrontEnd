import {
  CcamDataType,
  form as ccamForm
} from 'components/CreationCohort/DiagramView/components/LogicalOperator/components/CriteriaRightPanel/forms/CCAMForm'
import {
  DemographicDataType,
  form as demographicForm
} from 'components/CreationCohort/DiagramView/components/LogicalOperator/components/CriteriaRightPanel/forms/DemographicForm'
import {
  EncounterDataType,
  form as encounterForm
} from 'components/CreationCohort/DiagramView/components/LogicalOperator/components/CriteriaRightPanel/forms/EncounterForm'
import {
  IPPListDataType,
  form as ippForm
} from 'components/CreationCohort/DiagramView/components/LogicalOperator/components/CriteriaRightPanel/forms/IPPForm'
import { SelectedCriteriaType } from 'types/requestCriterias'

const defaultProcedureCriteria: CcamDataType = {
  id: 1,
  ...ccamForm().initialData
}

const defaultPatientCriteria: DemographicDataType = {
  id: 1,
  ...demographicForm().initialData
}

const defaultEncounterCriteria: EncounterDataType = {
  id: 1,
  ...encounterForm().initialData
}

const defaultIPPCriteria: IPPListDataType = {
  id: 1,
  ...ippForm().initialData
}

export const procedurePeudonimizedCriteria: SelectedCriteriaType[] = [
  {
    ...defaultProcedureCriteria,
    startOccurrence: { start: '2024-08-15', end: '2024-08-22' },
    encounterStartDate: { start: '2024-08-07', end: '2024-08-21' },
    encounterStatus: ['cancelled'],
    encounterEndDate: { start: '2024-08-22', end: '2024-08-22' },
    code: [
      {
        id: '000212',
        label: "000212 - Actes Diagnostiques Sur L'oreille",
        above_levels_ids: '*',
        inferior_levels_ids: '',
        system:
          'https://www.atih.sante.fr/plateformes-de-transmission-et-logiciels/logiciels-espace-de-telechargement/id_lot/3550'
      },
      {
        id: '000489',
        label: '000489 - Actes Thérapeutiques Sur Les Vaisseaux Intracrâniens',
        above_levels_ids: '*',
        inferior_levels_ids: '',
        system:
          'https://www.atih.sante.fr/plateformes-de-transmission-et-logiciels/logiciels-espace-de-telechargement/id_lot/3550'
      }
    ]
  }
]

export const patientPseudonimizedCriteria: SelectedCriteriaType[] = [
  {
    ...defaultPatientCriteria,
    genders: ['f'],
    vitalStatus: ['alive']
  }
]

export const patientPseudonimizedAgeCriteria: SelectedCriteriaType[] = [
  {
    ...defaultPatientCriteria,
    age: { start: '0/2/12', end: '0/5/15' }
  }
]

export const patientNominativeAge0Criteria: SelectedCriteriaType[] = [
  {
    ...defaultPatientCriteria,
    age: { start: '7/2/12', end: '0/5/15' }
  }
]

export const patientNominativeAge1Criteria: SelectedCriteriaType[] = [
  {
    ...defaultPatientCriteria,
    age: { start: '0/2/12', end: '8/5/15' }
  }
]

export const patientNominativeBirthdates: SelectedCriteriaType[] = [
  {
    ...defaultPatientCriteria,
    birthdates: { start: '2024-08-15', end: '2024-08-15' }
  }
]

export const patientNominativeDeathDates: SelectedCriteriaType[] = [
  {
    ...defaultPatientCriteria,
    deathDates: { start: '2024-08-15', end: '2024-08-15' }
  }
]

export const criteriasArrayWtihNominativeData: SelectedCriteriaType[] = [
  ...procedurePeudonimizedCriteria,
  {
    ...defaultPatientCriteria,
    genders: ['f'],
    vitalStatus: ['true'],
    deathDates: { start: '2024-08-15', end: '2024-08-15' }
  }
]

export const criteriaArrayWithNoNominativeData: SelectedCriteriaType[] = [
  ...procedurePeudonimizedCriteria,
  {
    ...defaultPatientCriteria,
    genders: ['f'],
    vitalStatus: ['false'],
    age: { start: '0/1/2', end: '0/5/15' }
  }
]

export const ippNominativeCriteria: SelectedCriteriaType[] = [
  {
    ...defaultIPPCriteria,
    search: '800000000, 800000001,8514257145'
  }
]

export const ippEmptyCriteria: SelectedCriteriaType[] = [
  {
    ...defaultIPPCriteria
  }
]

export const encounterPseudonimizedCriteria: SelectedCriteriaType[] = [
  {
    ...defaultEncounterCriteria
  }
]

export const encounterPseudoAgeCriteria: SelectedCriteriaType[] = [
  {
    ...defaultEncounterCriteria,
    age: { start: '0/1/2', end: '0/5/15' }
  }
]

export const encounterNominativeAgeCriteria: SelectedCriteriaType[] = [
  {
    ...defaultEncounterCriteria,
    age: { start: '2/1/2', end: '5/5/15' }
  }
]
