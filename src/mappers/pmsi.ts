import { getConfig } from 'config'
import { Claim, Condition, Procedure } from 'fhir/r4'
import { CohortPMSI } from 'types'
import { PMSIResourceTypes, ResourceType } from 'types/requestCriterias'

export const getLastDiagnosisLabels = (mainDiagnosisList: Condition[]) => {
  const mainDiagnosisLabels = mainDiagnosisList.map((diagnosis) => diagnosis.code?.coding?.[0].display)
  if (mainDiagnosisLabels.length > 0) {
    const lastThreeDiagnosisLabels = mainDiagnosisLabels
      .filter((diagnosis, index) => mainDiagnosisLabels.indexOf(diagnosis) === index)
      .slice(0, 3)
      .join(' - ')

    return lastThreeDiagnosisLabels
  } else {
    return '-'
  }
}

export const getPmsiDate = (tabId: PMSIResourceTypes, pmsiItem: CohortPMSI) => {
  const dateMapper = {
    [ResourceType.CONDITION]: (pmsiItem as Condition).recordedDate,
    [ResourceType.PROCEDURE]: (pmsiItem as Procedure).performedDateTime,
    [ResourceType.CLAIM]: (pmsiItem as Claim).created
  }

  return dateMapper[tabId]
}

export const getPmsiCodes = (tabId: PMSIResourceTypes, pmsiItem: CohortPMSI) => {
  const appConfig = getConfig()
  const dateMapper = {
    [ResourceType.CONDITION]: (pmsiItem as Condition)?.code?.coding?.find(
      (code) => !appConfig.core.fhir.selectedCodeOnly || code.userSelected
    ) ?? {
      display: null,
      code: null
    },
    [ResourceType.PROCEDURE]: (pmsiItem as Procedure)?.code?.coding?.find(
      (code) => !appConfig.core.fhir.selectedCodeOnly || code.userSelected
    ) ?? {
      display: null,
      code: null
    },
    [ResourceType.CLAIM]: (pmsiItem as Claim)?.diagnosis?.[0].diagnosisCodeableConcept?.coding?.find(
      (code) => !appConfig.core.fhir.selectedCodeOnly || code.userSelected
    ) ?? {
      display: null,
      code: null
    }
  }

  return dateMapper[tabId]
}
