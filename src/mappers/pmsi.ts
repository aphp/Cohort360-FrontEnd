import { getConfig } from 'config'
import { Claim, Condition, Procedure } from 'fhir/r4'
import { Medication, Pmsi } from 'state/patient'
import { CohortPMSI } from 'types'
import { PMSILabel } from 'types/patient'
import { PMSIResourceTypes, ResourceType } from 'types/requestCriterias'
import { SourceType } from 'types/scope'
import { Order } from 'types/searchCriterias'

export function mapToAttribute(
  type: ResourceType.MEDICATION_ADMINISTRATION | ResourceType.MEDICATION_REQUEST
): keyof Medication
export function mapToAttribute(type: PMSIResourceTypes): keyof Pmsi
export function mapToAttribute(type: ResourceType) {
  switch (type) {
    case ResourceType.MEDICATION_ADMINISTRATION:
      return 'administration'
    case ResourceType.MEDICATION_REQUEST:
      return 'prescription'
    case ResourceType.CONDITION:
      return 'condition'
    case ResourceType.CLAIM:
      return 'claim'
    case ResourceType.PROCEDURE:
      return 'procedure'
  }
}

export function mapToLabel(
  type: ResourceType.MEDICATION_ADMINISTRATION | ResourceType.MEDICATION_REQUEST
): 'administration(s)' | 'prescription(s)'
export function mapToLabel(type: PMSIResourceTypes): PMSILabel
export function mapToLabel(type: ResourceType) {
  switch (type) {
    case ResourceType.CONDITION:
      return PMSILabel.DIAGNOSTIC
    case ResourceType.PROCEDURE:
      return PMSILabel.CCAM
    case ResourceType.CLAIM:
      return PMSILabel.GHM
    case ResourceType.MEDICATION_ADMINISTRATION:
      return 'administration(s)'
    case ResourceType.MEDICATION_REQUEST:
      return 'prescription(s)'
  }
}

export const mapToLabelSingular = (tabId: PMSIResourceTypes) => {
  const mapToLabel = {
    [ResourceType.CONDITION]: 'GHM',
    [ResourceType.PROCEDURE]: 'acte',
    [ResourceType.CLAIM]: 'diagnostic'
  }

  return mapToLabel[tabId]
}

export const mapToUrlCode = (tabId: PMSIResourceTypes) => {
  const mapToUrlCode = {
    [ResourceType.CONDITION]: getConfig().features.condition.valueSets.conditionHierarchy.url,
    [ResourceType.PROCEDURE]: getConfig().features.procedure.valueSets.procedureHierarchy.url,
    [ResourceType.CLAIM]: getConfig().features.claim.valueSets.claimHierarchy.url
  }

  return mapToUrlCode[tabId]
}

export const mapToSourceType = (tabId: PMSIResourceTypes) => {
  const tabIdMapper = {
    [ResourceType.CONDITION]: SourceType.CIM10,
    [ResourceType.PROCEDURE]: SourceType.CCAM,
    [ResourceType.CLAIM]: SourceType.GHM
  }

  return tabIdMapper[tabId]
}

export const mapToDate = (tabId: PMSIResourceTypes, pmsiItem: CohortPMSI) => {
  const dateMapper = {
    [ResourceType.CONDITION]: (pmsiItem as Condition).recordedDate,
    [ResourceType.PROCEDURE]: (pmsiItem as Procedure).performedDateTime,
    [ResourceType.CLAIM]: (pmsiItem as Claim).created
  }

  return dateMapper[tabId] ? new Date(dateMapper[tabId] as string).toLocaleDateString('fr-FR') : 'Date inconnue'
}

export const mapToOrderByCode = (code: Order, resourceType: PMSIResourceTypes) => {
  const dateName = {
    [ResourceType.CONDITION]: Order.RECORDED_DATE,
    [ResourceType.PROCEDURE]: Order.DATE,
    [ResourceType.CLAIM]: Order.CREATED
  }

  const codeName = {
    [ResourceType.CONDITION]: Order.CODE,
    [ResourceType.PROCEDURE]: Order.CODE,
    [ResourceType.CLAIM]: Order.DIAGNOSIS
  }

  return code === Order.CODE ? codeName[resourceType] : dateName[resourceType]
}
