import { ResourceType } from 'types/requestCriterias'

const defaultCriteria = {
  _type: 'andGroup',
  _id: 1,
  name: 'defaultCriteria',
  isInclusive: true,
  resourceType: ResourceType.ENCOUNTER,
  filterFhir: ''
}

export const emptyEncounterJson = {
  ...defaultCriteria,
  name: 'Encounter',
  filterFhir: 'subject.active=true'
}

export const completeEncounterJson = {
  ...defaultCriteria,
  name: 'Encounter',
  filterFhir:
    'subject.active=true,reason-code=mode1,mode2,admission-mode=entry1,entry2,discharge-disposition-mode=exit1,exit2,class=prise1,prise2,stay=sejour1,sejour2,discharge-disposition=destination1,destination2,admit-source=provenance1,provenance2,admission-type=admission1,admission2,admission-destination-type=reason1,reason2,encounter-care-site=8312002244,status=status1,status2,length=ge1616,length=le1616,start-age-visit=ge428,start-age-visit=le428,_filter=(period-start ge 2024-09-05T00:00:00Z and period-start le 2024-09-05T00:00:00Z) or not (period-start eq "*"),_filter=(period-end ge 2024-09-06T00:00:00Z and period-end le 2024-09-07T00:00:00Z) or not (period-end eq "*")'
}

export const emptyDocumentJson = {
  ...defaultCriteria,
  name: 'Document',
  resourceType: ResourceType.DOCUMENTS,
  filterFhir: 'type:not=doc-impor&contenttype=text/plain&subject.active=true'
}

export const completeDocumentJson = {
  ...defaultCriteria,
  name: 'Document',
  resourceType: ResourceType.DOCUMENTS,
  filterFhir:
    'type:not=doc-impor&contenttype=text/plain&subject.active=true,encounter.encounter-care-site=8312016825,_text=cancer,docstatus=http://hl7.org/fhir/CodeSystem/composition-status|final,http://hl7.org/fhir/CodeSystem/composition-status|preliminary,type=crh-j,crh-chir,encounter.status=cancelled,date=ge2024-09-02T00:00:00Z,date=le2024-09-04T00:00:00Z,_filter=(encounter.period-start ge 2024-09-05T00:00:00Z and encounter.period-start le 2024-09-05T00:00:00Z) or not (encounter.period-start eq "*"),_filter=(encounter.period-end ge 2024-09-06T00:00:00Z and encounter.period-end le 2024-09-07T00:00:00Z) or not (encounter.period-end eq "*")'
}

export const emptyConditionJson = {
  ...defaultCriteria,
  name: 'Condition',
  resourceType: ResourceType.CONDITION,
  filterFhir: 'subject.active=true'
}

export const completeConditionJson = {
  ...defaultCriteria,
  name: 'Condition',
  resourceType: ResourceType.CONDITION,
  filterFhir:
    'subject.active=true,code=I841,I842,orbis-status=fp,f,_source=AREM,encounter.encounter-care-site=8312016825,encounter.status=finished,_filter=(encounter.period-start ge 2024-09-05T00:00:00Z and encounter.period-start le 2024-09-05T00:00:00Z) or not (encounter.period-start eq "*"),encounter.period-end=ge2024-09-06T00:00:00Z&encounter.period-end=le2024-09-07T00:00:00Z'
}

export const emptyProcedureJson = {
  ...defaultCriteria,
  name: 'Procedure',
  resourceType: ResourceType.PROCEDURE,
  filterFhir: 'subject.active=true'
}

export const completeProcedureJson = {
  ...defaultCriteria,
  name: 'Procedure',
  resourceType: ResourceType.PROCEDURE,
  filterFhir:
    'subject.active=true,code=000126,000127,encounter.encounter-care-site=8312016825,encounter.status=entered-in-error,date=ge2024-09-06T00:00:00Z,date=le2024-09-06T00:00:00Z,_source=ORBIS,encounter.period-start=ge2024-09-05T00:00:00Z&encounter.period-start=le2024-09-05T00:00:00Z,_filter=(encounter.period-end ge 2024-09-06T00:00:00Z and encounter.period-end le 2024-09-07T00:00:00Z) or not (encounter.period-end eq "*")'
}

export const emptyClaimJson = {
  ...defaultCriteria,
  name: 'Claim',
  resourceType: ResourceType.CLAIM,
  filterFhir: 'patient.active=true'
}

export const completeClaimJson = {
  ...defaultCriteria,
  name: 'Claim',
  resourceType: ResourceType.CLAIM,
  filterFhir:
    'patient.active=true,diagnosis=05C021,05C022,05C023,05C024,encounter.encounter-care-site=8312016825,encounter.status=cancelled,created=ge2024-09-03T00:00:00Z,created=le2024-09-04T00:00:00Z,_filter=(encounter.period-start ge 2024-09-04T00:00:00Z and encounter.period-start le 2024-09-07T00:00:00Z) or not (encounter.period-start eq "*"),encounter.period-end=ge2024-09-02T00:00:00Z&encounter.period-end=le2024-09-06T00:00:00Z'
}

export const emptyMedicationJson = {
  ...defaultCriteria,
  name: 'MedicationAdministration',
  resourceType: ResourceType.MEDICATION_ADMINISTRATION,
  filterFhir: 'subject.active=true'
}

export const completeMedicationAdministrationJson = {
  ...defaultCriteria,
  name: 'MedicationAdministration',
  resourceType: ResourceType.MEDICATION_ADMINISTRATION,
  filterFhir:
    'subject.active=true,dosage-route=CUTAN,context.encounter-care-site=8312016825,code=https://terminology.eds.aphp.fr/atc|D01AA01,https://terminology.eds.aphp.fr/atc|D01AA02,https://terminology.eds.aphp.fr/smt-medicament-ucd|3400890000055,context.status=cancelled,effective-time=ge2024-09-03T00:00:00Z,effective-time=le2024-09-04T00:00:00Z,_filter=(context.period-start ge 2024-09-04T00:00:00Z and context.period-start le 2024-09-07T00:00:00Z) or not (context.period-start eq "*"),context.period-end=ge2024-09-02T00:00:00Z&context.period-end=le2024-09-06T00:00:00Z'
}

export const completeMedicationRequestJson = {
  ...defaultCriteria,
  name: 'MedicationRequest',
  resourceType: ResourceType.MEDICATION_REQUEST,
  filterFhir:
    'subject.active=true,encounter.encounter-care-site=8312016825,code=https://terminology.eds.aphp.fr/atc|D01AA01,https://terminology.eds.aphp.fr/atc|D01AA02,https://terminology.eds.aphp.fr/smt-medicament-ucd|3400890000055,encounter.status=cancelled,validity-period-start=ge2024-09-03T00:00:00Z,validity-period-start=le2024-09-04T00:00:00Z,category=172641,_filter=(encounter.period-start ge 2024-09-04T00:00:00Z and encounter.period-start le 2024-09-07T00:00:00Z) or not (encounter.period-start eq "*"),encounter.period-end=ge2024-09-02T00:00:00Z&encounter.period-end=le2024-09-06T00:00:00Z'
}

export const emptyObservationJson = {
  ...defaultCriteria,
  name: 'Observation',
  resourceType: ResourceType.OBSERVATION,
  filterFhir: 'subject.active=true&status=Val,value-quantity=le0,ge0'
}

export const completeObservationJson = {
  ...defaultCriteria,
  name: 'Observation',
  resourceType: ResourceType.OBSERVATION,
  filterFhir:
    'subject.active=true&status=Val,code=I3356,encounter.encounter-care-site=8312016825,encounter.status=cancelled,date=ge2024-09-03T00:00:00Z,date=le2024-09-04T00:00:00Z,value-quantity=3,_filter=(encounter.period-start ge 2024-09-04T00:00:00Z and encounter.period-start le 2024-09-07T00:00:00Z) or not (encounter.period-start eq "*"),encounter.period-end=ge2024-09-02T00:00:00Z&encounter.period-end=le2024-09-06T00:00:00Z'
}

export const emptyImagingJson = {
  ...defaultCriteria,
  name: 'Imaging',
  resourceType: ResourceType.IMAGING,
  filterFhir: 'patient.active=true,numberOfSeries=1,numberOfInstances=1'
}

export const completeImagingJson = {
  ...defaultCriteria,
  name: 'Imaging',
  resourceType: ResourceType.IMAGING,
  filterFhir:
    'patient.active=true,numberOfSeries=1,numberOfInstances=1,encounter.status=cancelled,_filter=(encounter.period-start ge 2024-09-04T00:00:00Z and encounter.period-start le 2024-09-07T00:00:00Z) or not (encounter.period-start eq "*"),encounter.period-end=ge2024-09-02T00:00:00Z&encounter.period-end=le2024-09-06T00:00:00Z'
}
