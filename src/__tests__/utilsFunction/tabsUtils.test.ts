import { PMSILabel } from 'types/patient'
import { MedicationLabel, ResourceType } from 'types/requestCriterias'
import { getMedicationTab, getPMSITab } from 'utils/tabsUtils'

const pmsiDefaultTab = { label: PMSILabel.DIAGNOSTIC, id: ResourceType.CONDITION }

describe('test of getPMSITab', () => {
  it('should return default tabId is empty', () => {
    const tabId = ''
    expect(getPMSITab(tabId)).toStrictEqual(pmsiDefaultTab)
  })
  it('should return default tabId doesnt exist in PMSITabs', () => {
    const tabId = 'whatever'
    expect(getPMSITab(tabId)).toStrictEqual(pmsiDefaultTab)
  })
  it('should return the tab matching to the id given', () => {
    const tabId = ResourceType.PROCEDURE
    expect(getPMSITab(tabId)).toStrictEqual({ label: PMSILabel.CCAM, id: ResourceType.PROCEDURE })
  })
  it('should return the tab matching to the id given even if the casing is wrong', () => {
    const tabId = ResourceType.PROCEDURE.toLocaleUpperCase()
    expect(getPMSITab(tabId)).toStrictEqual({ label: PMSILabel.CCAM, id: ResourceType.PROCEDURE })
  })
})

const medicationDefaultTab = { label: MedicationLabel.PRESCRIPTION, id: ResourceType.MEDICATION_REQUEST }

describe('test of getMedicationTab', () => {
  it('should return default tabId is empty', () => {
    const tabId = ''
    expect(getMedicationTab(tabId)).toStrictEqual(medicationDefaultTab)
  })
  it('should return default tabId doesnt exist in MedicationTabs', () => {
    const tabId = 'test'
    expect(getMedicationTab(tabId)).toStrictEqual(medicationDefaultTab)
  })
  it('should return the tab matching to the id given', () => {
    const tabId = ResourceType.MEDICATION_ADMINISTRATION
    expect(getMedicationTab(tabId)).toStrictEqual({
      label: MedicationLabel.ADMINISTRATION,
      id: ResourceType.MEDICATION_ADMINISTRATION
    })
  })
  it('should return the tab matching to the id given even if the casing is wrong', () => {
    const tabId = ResourceType.MEDICATION_ADMINISTRATION.toLocaleUpperCase()
    expect(getMedicationTab(tabId)).toStrictEqual({
      label: MedicationLabel.ADMINISTRATION,
      id: ResourceType.MEDICATION_ADMINISTRATION
    })
  })
})
