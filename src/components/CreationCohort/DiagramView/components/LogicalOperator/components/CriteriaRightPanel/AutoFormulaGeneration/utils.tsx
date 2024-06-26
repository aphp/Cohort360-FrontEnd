import { CriteriaType, HospitDataType } from 'types/requestCriterias' //WIP : work in progress

export const typeOfSelectedCriteria = (type: string) => { //WIP : work in progress
  if (type === CriteriaType.HOSPIT) return type as unknown as HospitDataType //WIP : work in progress
}
