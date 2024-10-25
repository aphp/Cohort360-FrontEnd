import { medicationTabs } from 'components/Patient/PatientMedication/PatientMedication'
import { PMSITabs } from 'components/Patient/PatientPMSI/PatientPMSI'
import { PMSILabel } from 'types/patient'
import { MedicationLabel, ResourceType } from 'types/requestCriterias'

export const getPMSITab = (tabId?: string) => {
  return (
    PMSITabs.find((tab) => tab.id.toLocaleLowerCase() === tabId?.toLocaleLowerCase()) ?? {
      id: ResourceType.CONDITION,
      label: PMSILabel.DIAGNOSTIC
    }
  )
}

export const getMedicationTab = (tabId?: string) => {
  return (
    medicationTabs.find((tab) => tab.id.toLocaleLowerCase() === tabId?.toLocaleLowerCase()) ?? {
      id: ResourceType.MEDICATION_REQUEST,
      label: MedicationLabel.PRESCRIPTION
    }
  )
}
