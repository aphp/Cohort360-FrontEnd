import { form } from '__tests__/data/explorationData/questionnaires'
import { Encounter, Patient } from 'fhir/r4'
import {
  getEncounterIdPath,
  getLinkedEncounter,
  getLinkedPatient,
  getPatientIdPath,
  retrieveEncounterIds,
  retrievePatientIds
} from 'utils/fillElement'

const _form = {
  ...form,
  subject: {
    reference: 'Patient/1'
  },
  encounter: {
    reference: 'Encounter/1'
  }
}

describe('test of getPatientIdPath function', () => {
  it('should return the patientId path of the resource asked', () => {
    expect(getPatientIdPath(form)).toBe(form.subject?.reference?.replace(/^Patient\//, ''))
  })
})

describe('test of getEncounterIdPath function', () => {
  it('should return the encounterId path of the resource asked', () => {
    expect(getEncounterIdPath(form)).toBe(form.encounter?.reference?.replace(/^Encounter\//, ''))
  })
})

describe('test of retrieveEncounterIds function', () => {
  it('should return the encounter ids of the resource asked as a string', () => {
    expect(retrieveEncounterIds([_form])).toBe('1')
  })
  it('should not fail if one of the elements doesnt have the encounter id', () => {
    expect(retrieveEncounterIds([form])).toBe('')
  })
  it('should not fail if elementEntries is an empty array', () => {
    expect(retrieveEncounterIds([])).toBe('')
  })
})

describe('test of retrievePatientIds function', () => {
  it('should return the patient ids of the resource asked as a string', () => {
    expect(retrievePatientIds([_form])).toBe('1')
  })
  it('should not fail if one of the elements doesnt have the patient id', () => {
    expect(retrievePatientIds([form])).toBe('')
  })
  it('should not fail if elementEntries is an empty array', () => {
    expect(retrievePatientIds([])).toBe('')
  })
})

describe('test of getLinkedPatient function', () => {
  it("should return the patient that has the same id as the entry's", () => {
    const patient: Patient = {
      resourceType: 'Patient',
      id: '1'
    }
    expect(getLinkedPatient([patient], _form)).toBe(patient)
  })
  it("should return undefined if no patient id matches the entry's", () => {
    expect(getLinkedPatient([], _form)).toBeUndefined()
  })
})

describe('test of getLinkedEncounter function', () => {
  it("should return the encounter that has the same id as the entry's", () => {
    const encounter: Encounter = {
      resourceType: 'Encounter',
      id: '1',
      status: 'finished',
      class: {}
    }
    expect(getLinkedEncounter([encounter], _form)).toBe(encounter)
  })
  it("should return undefined if no encounter id matches the entry's", () => {
    expect(getLinkedEncounter([], _form)).toBeUndefined()
  })
})
