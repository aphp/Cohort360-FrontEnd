import {
  SelectedCriteriaType
} from 'types/requestCriterias'
import {
  CcamDataType
} from 'components/CreationCohort/DiagramView/components/LogicalOperator/components/CriteriaRightPanel/forms/CCAMForm'
import {
  Cim10DataType
} from 'components/CreationCohort/DiagramView/components/LogicalOperator/components/CriteriaRightPanel/forms/Cim10Form'
import {
  DemographicDataType
} from 'components/CreationCohort/DiagramView/components/LogicalOperator/components/CriteriaRightPanel/forms/DemographicForm'
import {
  DocumentDataType
} from 'components/CreationCohort/DiagramView/components/LogicalOperator/components/CriteriaRightPanel/forms/DocumentsForm'
import {
  EncounterDataType
} from 'components/CreationCohort/DiagramView/components/LogicalOperator/components/CriteriaRightPanel/forms/EncounterForm'
import {
  GhmDataType
} from 'components/CreationCohort/DiagramView/components/LogicalOperator/components/CriteriaRightPanel/forms/GHMForm'
import {
  procedurePeudonimizedCriteria,
  ippNominativeCriteria,
  ippEmptyCriteria,
  encounterPseudonimizedCriteria,
  encounterPseudoAgeCriteria,
  encounterNominativeAgeCriteria,
  patientPseudonimizedCriteria,
  patientPseudonimizedAgeCriteria,
  patientNominativeAge0Criteria,
  patientNominativeAge1Criteria,
  patientNominativeBirthdates,
  patientNominativeDeathDates,
  criteriasArrayWtihNominativeData,
  criteriaArrayWithNoNominativeData
} from '__tests__/data/cohortCreation/cohortCreation'
import {
  completePatientCriteria,
  defaultPatientCriteria,
  patientDeceasedVitalStatusCriteria,
  patientGenderFemaleCriteria,
  patientGendersCriteria,
  patientNominativeAgeCriteria,
  patientNominativeBirthDatesCriteria,
  patientNominativeDeathDatesCriteria,
  patientVitalStatusCriteria
} from '__tests__/data/cohortCreation/patientCriteria'
import { completeEncounterCriteria, defaultEncounterCriteira } from '__tests__/data/cohortCreation/encounterCriteria'
import {
  checkNominativeCriteria,
  constructFhirFilter,
} from 'utils/cohortCreation'
import { completeDocumentCriteria, defaultDocumentCriteria } from '__tests__/data/cohortCreation/documentCriteria'
import { completeConditionCriteria, defaultConditionCriteria } from '__tests__/data/cohortCreation/conditionCriteria'
import { completeProcedureCriteria, defaultProcedureCriteria } from '__tests__/data/cohortCreation/procedureCriteria'
import {
  completeMedicationAdministrationCriteria,
  completeMedicationPrescriptionCriteria,
  defaultMedicationCriteria
} from '__tests__/data/cohortCreation/medicationCriteria'
import {
  completeObservationCriteria,
  defaultObservationCriteria
} from '__tests__/data/cohortCreation/observationCriteria'
import { completeImagingCriteria, defaultImagingCriteria } from '__tests__/data/cohortCreation/imagingCriteria'
import {
  MedicationDataType} from 'components/CreationCohort/DiagramView/components/LogicalOperator/components/CriteriaRightPanel/forms/MedicationForm'
import criteriaList, { getAllCriteriaItems } from 'components/CreationCohort/DataList_Criteria'
import { CriteriaItemType } from 'types'
import { ImagingDataType } from 'components/CreationCohort/DiagramView/components/LogicalOperator/components/CriteriaRightPanel/forms/ImagingForm'
import { ObservationDataType } from 'components/CreationCohort/DiagramView/components/LogicalOperator/components/CriteriaRightPanel/forms/BiologyForm'
import { completeClaimCriteria, defaultClaimCriteria } from '__tests__/data/cohortCreation/claimCriteria'
import { updateConfig } from 'config'

updateConfig({
  features: {
    encounter: {
      fhir: {
        searchParams: ['encounter-care-site']
      }
    }
  }
})

let allCriterias: CriteriaItemType[] | undefined = undefined

const getCriteriaList = () => {
  if (!allCriterias) {
    allCriterias = getAllCriteriaItems(criteriaList())
  }
  return allCriterias
}

const buildFilter = (criteria: SelectedCriteriaType, deidentified?: boolean) => {
  return constructFhirFilter(criteria, deidentified ?? false, getCriteriaList()).split("&")
}

describe('test of checkNominativeCriteria', () => {
  it('should return false if selectedCriteria is an empty array', () => {
    const selectedCriteria: SelectedCriteriaType[] = []
    expect(checkNominativeCriteria(selectedCriteria)).toBe(false)
  })
  it('should return false if selectedCriteria contain procedure pseudonimized criteria', () => {
    const selectedCriteria: SelectedCriteriaType[] = procedurePeudonimizedCriteria
    expect(checkNominativeCriteria(selectedCriteria)).toBe(false)
  })
  it('should return false if selectedCriteria contain patient pseudonimized criteria', () => {
    const selectedCriteria: SelectedCriteriaType[] = patientPseudonimizedCriteria
    expect(checkNominativeCriteria(selectedCriteria)).toBe(false)
  })
  it('should return false if selectedCriteria contains patient.age pseudonimized', () => {
    const selectedCriteria: SelectedCriteriaType[] = patientPseudonimizedAgeCriteria
    expect(checkNominativeCriteria(selectedCriteria)).toBe(false)
  })
  it('should return true if selectedCriteria contain patient.age[0] nominative', () => {
    const selectedCriteria: SelectedCriteriaType[] = patientNominativeAge0Criteria
    expect(checkNominativeCriteria(selectedCriteria)).toBe(true)
  })
  it('should return true if selectedCriteria contain patient.age[1] nominative', () => {
    const selectedCriteria: SelectedCriteriaType[] = patientNominativeAge1Criteria
    expect(checkNominativeCriteria(selectedCriteria)).toBe(true)
  })
  it('should return true if selectedCriteria contains a patient birthdates', () => {
    const selectedCriteria: SelectedCriteriaType[] = patientNominativeBirthdates
    expect(checkNominativeCriteria(selectedCriteria)).toBe(true)
  })
  it('should return true if selectedCriteria contains a patient deathDates', () => {
    const selectedCriteria: SelectedCriteriaType[] = patientNominativeDeathDates
    expect(checkNominativeCriteria(selectedCriteria)).toBe(true)
  })
  it('should return true if selectedCriteria contains a nominative criteria', () => {
    const selectedCriteria: SelectedCriteriaType[] = criteriasArrayWtihNominativeData
    expect(checkNominativeCriteria(selectedCriteria)).toBe(true)
  })
  it("should return false if selectedCriteria doesn't contains a nominative criteria", () => {
    const selectedCriteria: SelectedCriteriaType[] = criteriaArrayWithNoNominativeData
    expect(checkNominativeCriteria(selectedCriteria)).toBe(false)
  })
  it('should return true if selectedCriteria contains a nominative IPP.search', () => {
    const selectedCriteria: SelectedCriteriaType[] = ippNominativeCriteria
    expect(checkNominativeCriteria(selectedCriteria)).toBe(true)
  })
  it('should return true if selectedCriteria contains an IPP criteria', () => {
    const selectedCriteria: SelectedCriteriaType[] = ippEmptyCriteria
    expect(checkNominativeCriteria(selectedCriteria)).toBe(true)
  })
  it('should return false if selectedCriteria contains an encounter pseudonimized criteria', () => {
    const selectedCriteria: SelectedCriteriaType[] = encounterPseudonimizedCriteria
    expect(checkNominativeCriteria(selectedCriteria)).toBe(false)
  })
  it('should return false if selectedCriteria contains a peudonimize encounter.age', () => {
    const selectedCriteria: SelectedCriteriaType[] = encounterPseudoAgeCriteria
    expect(checkNominativeCriteria(selectedCriteria)).toBe(false)
  })
  it('should return true if selectedCriteria contains a nominative encounter.age', () => {
    const selectedCriteria: SelectedCriteriaType[] = encounterNominativeAgeCriteria
    expect(checkNominativeCriteria(selectedCriteria)).toBe(true)
  })
})

describe('test of buildPatientFilter', () => {
  it('should return default build Patient', () => {
    const selectedCriteria: DemographicDataType = defaultPatientCriteria
    const result = ['active=true', '', '', '', '', '', '', '', '']
    expect(buildFilter(selectedCriteria, false).filter(el => !!el).sort((a, b) => a.localeCompare(b)).join("&")).toEqual(result.filter(el => !!el).sort((a, b) => a.localeCompare(b)).join("&"))
  })
  it('should return gender female build Patient', () => {
    const selectedCriteria: DemographicDataType = patientGenderFemaleCriteria
    const result = ['active=true', 'gender=f', '', '', '', '', '', '', '']
    expect(buildFilter(selectedCriteria, false).filter(el => !!el).sort((a, b) => a.localeCompare(b)).join("&")).toEqual(result.filter(el => !!el).sort((a, b) => a.localeCompare(b)).join("&"))
  })
  it('should return genders build Patient', () => {
    const selectedCriteria: DemographicDataType = patientGendersCriteria
    const result = ['active=true', 'gender=f,m', '', '', '', '', '', '', '']
    expect(buildFilter(selectedCriteria, false).filter(el => !!el).sort((a, b) => a.localeCompare(b)).join("&")).toEqual(result.filter(el => !!el).sort((a, b) => a.localeCompare(b)).join("&"))
  })
  it('should return deceased vitalStatus build Patient', () => {
    const selectedCriteria: DemographicDataType = patientDeceasedVitalStatusCriteria
    const result = ['active=true', '', 'deceased=true', '', '', '', '', '', '']
    expect(buildFilter(selectedCriteria, false).filter(el => !!el).sort((a, b) => a.localeCompare(b)).join("&")).toEqual(result.filter(el => !!el).sort((a, b) => a.localeCompare(b)).join("&"))
  })
  it('should return vitalStatus build Patient', () => {
    const selectedCriteria: DemographicDataType = patientVitalStatusCriteria
    const result = ['active=true', '', 'deceased=true,false', '', '', '', '', '', '']
    expect(buildFilter(selectedCriteria, false).filter(el => !!el).sort((a, b) => a.localeCompare(b)).join("&")).toEqual(result.filter(el => !!el).sort((a, b) => a.localeCompare(b)).join("&"))
  })
  it('should return age build Patient', () => {
    const selectedCriteria: DemographicDataType = patientNominativeAgeCriteria
    const result = ['active=true', '', '', '', '', '', '', 'age-day=ge3082', 'age-day=le9360']
    expect(buildFilter(selectedCriteria, false).filter(el => !!el).sort((a, b) => a.localeCompare(b)).join("&")).toEqual(result.filter(el => !!el).sort((a, b) => a.localeCompare(b)).join("&"))
  })
  it('should return birthdates build Patient', () => {
    const selectedCriteria: DemographicDataType = patientNominativeBirthDatesCriteria
    const result = [
      'active=true',
      '',
      '',
      'birthdate=le2020-12-31T00:00:00Z',
      'birthdate=ge2020-01-01T00:00:00Z',
      '',
      '',
      '',
      ''
    ]
    expect(buildFilter(selectedCriteria, false).filter(el => !!el).sort((a, b) => a.localeCompare(b)).join("&")).toEqual(result.filter(el => !!el).sort((a, b) => a.localeCompare(b)).join("&"))
  })
  it('should return deathdates build Patient', () => {
    const selectedCriteria: DemographicDataType = patientNominativeDeathDatesCriteria
    const result = [
      'active=true',
      '',
      '',
      '',
      '',
      'death-date=ge2020-01-01T00:00:00Z',
      'death-date=le2020-12-31T00:00:00Z',
      '',
      ''
    ]
    expect(buildFilter(selectedCriteria, false).filter(el => !!el).sort((a, b) => a.localeCompare(b)).join("&")).toEqual(result.filter(el => !!el).sort((a, b) => a.localeCompare(b)).join("&"))
  })
  it('should return complete build Patient', () => {
    const selectedCriteria: DemographicDataType = completePatientCriteria
    const result = [
      'active=true',
      'gender=f,m',
      'deceased=true,false',
      'birthdate=le2020-12-31T00:00:00Z',
      'birthdate=ge2020-01-01T00:00:00Z',
      'death-date=ge2020-01-01T00:00:00Z',
      'death-date=le2020-12-31T00:00:00Z',
      '',
      ''
    ]
    const error = [
      'active=true',
      'gender=f,m',
      'deceased=true,false',
      'birthdate=le2020-12-31T00:00:00Z',
      'birthdate=ge2020-01-01T00:00:00Z',
      'death-date=ge2020-01-01T00:00:00Z',
      'death-date=le2020-12-31T00:00:00Z',
      'age-day=ge3082',
      'age-day=le9360'
    ]
    expect(buildFilter(selectedCriteria, false).filter(el => !!el).sort((a, b) => a.localeCompare(b)).join("&")).toEqual(result.filter(el => !!el).sort((a, b) => a.localeCompare(b)).join("&"))
    expect(buildFilter(selectedCriteria, false)).not.toEqual(error)
  })
  it('should return complete build Patient with no age', () => {
    const selectedCriteria: DemographicDataType = completePatientCriteria
    const error = [
      'active=true',
      'gender=f,m',
      'deceased=true,false',
      'birthdate=le2020-12-31T00:00:00Z',
      'birthdate=ge2020-01-01T00:00:00Z',
      'death-date=ge2020-01-01T00:00:00Z',
      'death-date=le2020-12-31T00:00:00Z',
      'age-day=ge3082',
      'age-day=le9360'
    ]
    expect(buildFilter(selectedCriteria, false)).not.toEqual(error)
  })
})

describe('test of buildEncounterFilter', () => {
  it('should return default build Encounter', () => {
    const selectedCriteria: EncounterDataType = defaultEncounterCriteira
    const result = ['subject.active=true', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '']
    expect(buildFilter(selectedCriteria, false).filter(el => !!el).sort((a, b) => a.localeCompare(b)).join("&")).toEqual(result.filter(el => !!el).sort((a, b) => a.localeCompare(b)).join("&"))
  })
  it('should return complete build Encounter', () => {
    const selectedCriteria: EncounterDataType = completeEncounterCriteria
    const result = [
      'subject.active=true',
      'reason-code=mode1,mode2',
      'admission-mode=entry1,entry2',
      'discharge-disposition-mode=exit1,exit2',
      'class=prise1,prise2',
      'stay=sejour1,sejour2',
      'discharge-disposition=destination1,destination2',
      'admit-source=provenance1,provenance2',
      'admission-type=admission1,admission2',
      'admission-destination-type=reason1,reason2',
      'encounter-care-site=8312002244',
      'status=status1,status2',
      'length=ge1616',
      'length=le1616',
      'start-age-visit=ge428',
      'start-age-visit=le428',
      '_filter=(period-start ge 2024-09-05T00:00:00Z and period-start le 2024-09-05T00:00:00Z) or not (period-start eq "*")',
      '_filter=(period-end ge 2024-09-06T00:00:00Z and period-end le 2024-09-07T00:00:00Z) or not (period-end eq "*")'
    ]
    expect(buildFilter(selectedCriteria, false).filter(el => !!el).sort((a, b) => a.localeCompare(b)).join("&")).toEqual(result.filter(el => !!el).sort((a, b) => a.localeCompare(b)).join("&"))
  })
})

describe('test of buildDocumentFilter', () => {
  it('should return default documentCriteria', () => {
    const selectedCriteria: DocumentDataType = defaultDocumentCriteria
    const result = ['contenttype=text/plain&subject.active=true&type:not=doc-impor', '', '', '', '', '', '', '', '', '']
    expect(buildFilter(selectedCriteria).filter(el => !!el).sort((a, b) => a.localeCompare(b)).join("&")).toEqual(result.filter(el => !!el).sort((a, b) => a.localeCompare(b)).join("&"))
  })
  it('should return complete documentCriteria', () => {
    const selectedCriteria: DocumentDataType = completeDocumentCriteria
    const result = [
      'contenttype=text/plain',
      'subject.active=true&type:not=doc-impor',
      'encounter.encounter-care-site=8312016825',
      '_text=cancer',
      'docstatus=http://hl7.org/fhir/CodeSystem/composition-status|final,http://hl7.org/fhir/CodeSystem/composition-status|preliminary',
      'type=crh-j,crh-chir',
      'encounter.status=cancelled',
      'date=ge2024-09-02T00:00:00Z',
      'date=le2024-09-04T00:00:00Z',
      '_filter=(encounter.period-start ge 2024-09-05T00:00:00Z and encounter.period-start le 2024-09-05T00:00:00Z) or not (encounter.period-start eq "*")',
      '_filter=(encounter.period-end ge 2024-09-06T00:00:00Z and encounter.period-end le 2024-09-07T00:00:00Z) or not (encounter.period-end eq "*")'
    ]
    expect(buildFilter(selectedCriteria).filter(el => !!el).sort((a, b) => a.localeCompare(b)).join("&")).toEqual(result.filter(el => !!el).sort((a, b) => a.localeCompare(b)).join("&"))
  })
})

describe('test of buildConditionFilter', () => {
  it('should return default conditionCriteria', () => {
    const selectedCriteria: Cim10DataType = defaultConditionCriteria
    const result = ['subject.active=true', '', '', '', '', '', '', '', '', '']
    expect(buildFilter(selectedCriteria).filter(el => !!el).sort((a, b) => a.localeCompare(b)).join("&")).toEqual(result.filter(el => !!el).sort((a, b) => a.localeCompare(b)).join("&"))
  })
  it('should return complete conditionCriteria', () => {
    const selectedCriteria: Cim10DataType = completeConditionCriteria
    const result = [
      'subject.active=true',
      'code=https://smt.esante.gouv.fr/terminologie-cim-10/|I841,https://smt.esante.gouv.fr/terminologie-cim-10/|I842',
      'orbis-status=fp,f',
      '_source=AREM',
      'encounter.encounter-care-site=8312016825',
      'encounter.status=finished',
      '',
      '',
      '_filter=(encounter.period-start ge 2024-09-05T00:00:00Z and encounter.period-start le 2024-09-05T00:00:00Z) or not (encounter.period-start eq "*")',
      'encounter.period-end=ge2024-09-06T00:00:00Z&encounter.period-end=le2024-09-07T00:00:00Z'
    ]
    expect(buildFilter(selectedCriteria).filter(el => !!el).sort((a, b) => a.localeCompare(b)).join("&")).toEqual(result.filter(el => !!el).sort((a, b) => a.localeCompare(b)).join("&"))
  })
})

describe('test of buildProcedureFilter', () => {
  it('should return default procedureCriteria', () => {
    const selectedCriteria: CcamDataType = defaultProcedureCriteria
    const result = ['subject.active=true', '', '', '', '', '', '', '', '']
    expect(buildFilter(selectedCriteria).filter(el => !!el).sort((a, b) => a.localeCompare(b)).join("&")).toEqual(result.filter(el => !!el).sort((a, b) => a.localeCompare(b)).join("&"))
  })
  it('should return complete procedureCriteria ', () => {
    const selectedCriteria: CcamDataType = completeProcedureCriteria
    const result = [
      'subject.active=true',
      'code=https://www.atih.sante.fr/plateformes-de-transmiss…ls/logiciels-espace-de-telechargement/id_lot/3550|000126,https://www.atih.sante.fr/plateformes-de-transmiss…ls/logiciels-espace-de-telechargement/id_lot/3550|000127',
      'encounter.encounter-care-site=8312016825',
      'encounter.status=entered-in-error',
      'date=ge2024-09-06T00:00:00Z',
      'date=le2024-09-06T00:00:00Z',
      '_source=ORBIS',
      'encounter.period-start=ge2024-09-05T00:00:00Z&encounter.period-start=le2024-09-05T00:00:00Z',
      '_filter=(encounter.period-end ge 2024-09-06T00:00:00Z and encounter.period-end le 2024-09-07T00:00:00Z) or not (encounter.period-end eq "*")'
    ]
    expect(buildFilter(selectedCriteria).filter(el => !!el).sort((a, b) => a.localeCompare(b)).join("&")).toEqual(result.filter(el => !!el).sort((a, b) => a.localeCompare(b)).join("&"))
  })
})

describe('test of buildClaimFilter', () => {
  it('should return default claimCriteria', () => {
    const selectedCriteria: GhmDataType = defaultClaimCriteria
    const result = ['patient.active=true', '', '', '', '', '', '', '']
    expect(buildFilter(selectedCriteria).filter(el => !!el).sort((a, b) => a.localeCompare(b)).join("&")).toEqual(result.filter(el => !!el).sort((a, b) => a.localeCompare(b)).join("&"))
  })
  it('should return complete claimCriteria', () => {
    const selectedCriteria: GhmDataType = completeClaimCriteria
    const result = [
      'patient.active=true',
      'diagnosis=https://terminology.eds.aphp.fr/aphp-orbis-ghm|05C021,https://terminology.eds.aphp.fr/aphp-orbis-ghm|05C022,https://terminology.eds.aphp.fr/aphp-orbis-ghm|05C023,https://terminology.eds.aphp.fr/aphp-orbis-ghm|05C024',
      'encounter.encounter-care-site=8312016825',
      'encounter.status=cancelled',
      'created=ge2024-09-03T00:00:00Z',
      'created=le2024-09-04T00:00:00Z',
      '_filter=(encounter.period-start ge 2024-09-04T00:00:00Z and encounter.period-start le 2024-09-07T00:00:00Z) or not (encounter.period-start eq "*")',
      'encounter.period-end=ge2024-09-02T00:00:00Z&encounter.period-end=le2024-09-06T00:00:00Z'
    ]
    expect(buildFilter(selectedCriteria).filter(el => !!el).sort((a, b) => a.localeCompare(b)).join("&")).toEqual(result.filter(el => !!el).sort((a, b) => a.localeCompare(b)).join("&"))
  })
})

describe('test of buildMedicationFilter', () => {
  it('should return default Medication administation criteria', () => {
    const selectedCriteria: MedicationDataType = defaultMedicationCriteria
    const result = ['subject.active=true', '', '', '', '', '', '', '', '', '', '', '']
    expect(buildFilter(selectedCriteria).filter(el => !!el).sort((a, b) => a.localeCompare(b)).join("&")).toEqual(result.filter(el => !!el).sort((a, b) => a.localeCompare(b)).join("&"))
  })
  it('should return complete Medication administation criteria', () => {
    const selectedCriteria: MedicationDataType = completeMedicationAdministrationCriteria
    const result = [
      'subject.active=true',
      'dosage-route=CUTAN',
      'context.encounter-care-site=8312016825',
      'code=https://terminology.eds.aphp.fr/atc|D01AA01,https://terminology.eds.aphp.fr/atc|D01AA02,https://terminology.eds.aphp.fr/smt-medicament-ucd|3400890000055',
      'context.status=cancelled',
      'effective-time=ge2024-09-03T00:00:00Z',
      'effective-time=le2024-09-04T00:00:00Z',
      '',
      '',
      '',
      '_filter=(context.period-start ge 2024-09-04T00:00:00Z and context.period-start le 2024-09-07T00:00:00Z) or not (context.period-start eq "*")',
      'context.period-end=ge2024-09-02T00:00:00Z&context.period-end=le2024-09-06T00:00:00Z'
    ]
    expect(buildFilter(selectedCriteria).filter(el => !!el).sort((a, b) => a.localeCompare(b)).join("&")).toEqual(result.filter(el => !!el).sort((a, b) => a.localeCompare(b)).join("&"))
  })
  it('should return default Medication administation criteria', () => {
    const selectedCriteria: MedicationDataType = completeMedicationPrescriptionCriteria
    const result = [
      'subject.active=true',
      '',
      'encounter.encounter-care-site=8312016825',
      'code=https://terminology.eds.aphp.fr/atc|D01AA01,https://terminology.eds.aphp.fr/atc|D01AA02,https://terminology.eds.aphp.fr/smt-medicament-ucd|3400890000055',
      'encounter.status=cancelled',
      'validity-period-start=ge2024-09-03T00:00:00Z',
      'validity-period-start=le2024-09-04T00:00:00Z',
      '',
      '',
      'category=172641',
      '_filter=(encounter.period-start ge 2024-09-04T00:00:00Z and encounter.period-start le 2024-09-07T00:00:00Z) or not (encounter.period-start eq "*")',
      'encounter.period-end=ge2024-09-02T00:00:00Z&encounter.period-end=le2024-09-06T00:00:00Z'
    ]
    expect(buildFilter(selectedCriteria).filter(el => !!el).sort((a, b) => a.localeCompare(b)).join("&")).toEqual(result.filter(el => !!el).sort((a, b) => a.localeCompare(b)).join("&"))
  })
})

describe('test of buildObservationFilter', () => {
  it('should return build default observation criteria', () => {
    const selectedCriteria: ObservationDataType = defaultObservationCriteria
    const result = ['status=Val&subject.active=true', '', '', '', '', '', 'value-quantity=le0,ge0', '', '']
    expect(buildFilter(selectedCriteria).filter(el => !!el).sort((a, b) => a.localeCompare(b)).join("&")).toEqual(result.filter(el => !!el).sort((a, b) => a.localeCompare(b)).join("&"))
  })
  it('should return build complete obervation criteria', () => {
    const selectedCriteria: ObservationDataType = completeObservationCriteria
    const result = [
      'status=Val&subject.active=true',
      'code=https://terminology.eds.aphp.fr/aphp-itm-anabio|I3356',
      'encounter.encounter-care-site=8312016825',
      'encounter.status=cancelled',
      'date=ge2024-09-03T00:00:00Z',
      'date=le2024-09-04T00:00:00Z',
      'value-quantity=3',
      '_filter=(encounter.period-start ge 2024-09-04T00:00:00Z and encounter.period-start le 2024-09-07T00:00:00Z) or not (encounter.period-start eq "*")',
      'encounter.period-end=ge2024-09-02T00:00:00Z&encounter.period-end=le2024-09-06T00:00:00Z'
    ]
    expect(buildFilter(selectedCriteria).filter(el => !!el).sort((a, b) => a.localeCompare(b)).join("&")).toEqual(result.filter(el => !!el).sort((a, b) => a.localeCompare(b)).join("&"))
  })
})

describe('test of buildImagingFilter', () => {
  it('should return build default imaging criteria', () => {
    const selectedCriteria: ImagingDataType = defaultImagingCriteria
    const result = [
      'patient.active=true',
      '',
      '',
      '',
      '',
      '',
      '',
      '',
      '',
      '',
      '',
      '',
      'numberOfSeries=ge1',
      'numberOfInstances=1',
      '',
      '',
      '',
      '',
      '',
      ''
    ]
    expect(buildFilter(selectedCriteria).filter(el => !!el).sort((a, b) => a.localeCompare(b)).join("&")).toEqual(result.filter(el => !!el).sort((a, b) => a.localeCompare(b)).join("&"))
  })
  it('should return build complete imaging criteria', () => {
    const selectedCriteria: ImagingDataType = completeImagingCriteria
    const result = [
      'patient.active=true',
      '',
      '',
      '',
      '',
      '',
      '',
      '',
      '',
      '',
      '',
      '',
      'numberOfSeries=ge1',
      'numberOfInstances=1',
      'encounter.status=cancelled',
      '',
      '',
      '',
      '_filter=(encounter.period-start ge 2024-09-04T00:00:00Z and encounter.period-start le 2024-09-07T00:00:00Z) or not (encounter.period-start eq "*")',
      'encounter.period-end=ge2024-09-02T00:00:00Z&encounter.period-end=le2024-09-06T00:00:00Z'
    ]
    expect(buildFilter(selectedCriteria).filter(el => !!el).sort((a, b) => a.localeCompare(b)).join("&")).toEqual(result.filter(el => !!el).sort((a, b) => a.localeCompare(b)).join("&"))
  })
})


// describe('test of buildPregnancyFilter', () => {
//   it('', () => {
//     expect().toEqual()
//   })
// })

// describe('test of buildHospitFilter', () => {
//   it('', () => {
//     expect().toEqual()
//   })
// })
