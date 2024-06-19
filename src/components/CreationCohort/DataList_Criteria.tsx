import { CriteriaItemType } from 'types'

import RequestForm from './DiagramView/components/LogicalOperator/components/CriteriaRightPanel/RequestForm/RequestForm'
import IPPForm from './DiagramView/components/LogicalOperator/components/CriteriaRightPanel/IPPForm/IPPForm'
import DocumentsForm from './DiagramView/components/LogicalOperator/components/CriteriaRightPanel/DocumentsForm/DocumentsForm'
import EncounterForm from './DiagramView/components/LogicalOperator/components/CriteriaRightPanel/EncounterForm'
import CCAMForm from './DiagramView/components/LogicalOperator/components/CriteriaRightPanel/CCAM'
import Cim10Form from './DiagramView/components/LogicalOperator/components/CriteriaRightPanel/Cim10Form'
import GhmForm from './DiagramView/components/LogicalOperator/components/CriteriaRightPanel/GHM'
import MedicationForm from './DiagramView/components/LogicalOperator/components/CriteriaRightPanel/MedicationForm'
import BiologyForm from './DiagramView/components/LogicalOperator/components/CriteriaRightPanel/BiologyForm'
import DemographicForm from './DiagramView/components/LogicalOperator/components/CriteriaRightPanel/DemographicForm'
import ImagingForm from './DiagramView/components/LogicalOperator/components/CriteriaRightPanel/ImagingForm'
import PregnantForm from './DiagramView/components/LogicalOperator/components/CriteriaRightPanel/PregnantForm'
import HospitForm from './DiagramView/components/LogicalOperator/components/CriteriaRightPanel/HospitForm'

import services from 'services/aphp'

import { ODD_BIOLOGY, ODD_IMAGING, ODD_MEDICATION } from '../../constants'
import { CriteriaType, CriteriaTypeLabels } from 'types/requestCriterias'

const criteriaList: CriteriaItemType[] = [
  {
    id: 'Request',
    title: CriteriaTypeLabels.REQUEST,
    color: '#0063AF',
    fontWeight: 'bold',
    components: RequestForm
  },
  {
    id: 'IPPList',
    title: CriteriaTypeLabels.IPP_LIST,
    color: '#0063AF',
    fontWeight: 'bold',
    components: IPPForm,
    disabled: true
  },
  {
    id: 'Patient',
    title: CriteriaTypeLabels.PATIENT,
    color: '#0063AF',
    fontWeight: 'bold',
    components: DemographicForm,
    fetch: { gender: services.cohortCreation.fetchGender, status: services.cohortCreation.fetchStatus }
  },
  {
    id: 'Encounter',
    title: CriteriaTypeLabels.ENCOUNTER,
    color: '#0063AF',
    fontWeight: 'bold',
    components: EncounterForm,
    fetch: {
      admissionModes: services.cohortCreation.fetchAdmissionModes,
      entryModes: services.cohortCreation.fetchEntryModes,
      exitModes: services.cohortCreation.fetchExitModes,
      priseEnChargeType: services.cohortCreation.fetchPriseEnChargeType,
      typeDeSejour: services.cohortCreation.fetchTypeDeSejour,
      fileStatus: services.cohortCreation.fetchFileStatus,
      reason: services.cohortCreation.fetchReason,
      destination: services.cohortCreation.fetchDestination,
      provenance: services.cohortCreation.fetchProvenance,
      admission: services.cohortCreation.fetchAdmission,
      encounterStatus: services.cohortCreation.fetchEncounterStatus
    }
  },
  {
    id: 'DocumentReference',
    title: CriteriaTypeLabels.DOCUMENTS,
    color: '#0063AF',
    fontWeight: 'bold',
    components: DocumentsForm,
    fetch: {
      docTypes: services.cohortCreation.fetchDocTypes,
      encounterStatus: services.cohortCreation.fetchEncounterStatus
    }
  },
  {
    id: 'pmsi',
    title: CriteriaTypeLabels.PMSI,
    color: '#0063AF',
    fontWeight: 'bold',
    components: null,
    subItems: [
      {
        id: 'Condition',
        title: CriteriaTypeLabels.CONDITION,
        color: '#0063AF',
        fontWeight: 'normal',
        components: Cim10Form,
        fetch: {
          statusDiagnostic: services.cohortCreation.fetchStatusDiagnostic,
          diagnosticTypes: services.cohortCreation.fetchDiagnosticTypes,
          cim10Diagnostic: services.cohortCreation.fetchCim10Diagnostic,
          encounterStatus: services.cohortCreation.fetchEncounterStatus
        }
      },
      {
        id: 'Procedure',
        title: CriteriaTypeLabels.PROCEDURE,
        color: '#0063AF',
        fontWeight: 'normal',
        components: CCAMForm,
        fetch: {
          ccamData: services.cohortCreation.fetchCcamData,
          encounterStatus: services.cohortCreation.fetchEncounterStatus
        }
      },
      {
        id: 'Claim',
        title: CriteriaTypeLabels.CLAIM,
        color: '#0063AF',
        fontWeight: 'normal',
        components: GhmForm,
        fetch: {
          ghmData: services.cohortCreation.fetchGhmData,
          encounterStatus: services.cohortCreation.fetchEncounterStatus
        }
      }
    ]
  },
  {
    id: 'Medication',
    // title: 'Médicaments (Prescription - Dispension - Administration)',
    title: 'Médicaments (Prescription - Administration)',
    color: ODD_MEDICATION ? '#0063AF' : '#808080',
    fontWeight: 'bold',
    components: ODD_MEDICATION ? MedicationForm : null,
    disabled: !ODD_MEDICATION ?? false,
    fetch: {
      medicationData: services.cohortCreation.fetchMedicationData,
      prescriptionTypes: services.cohortCreation.fetchPrescriptionTypes,
      administrations: services.cohortCreation.fetchAdministrations,
      encounterStatus: services.cohortCreation.fetchEncounterStatus
    }
  },
  {
    id: 'biologie_microbiologie',
    title: CriteriaTypeLabels.BIO_MICRO,
    color: !!ODD_BIOLOGY ? '#0063AF' : '#808080',
    fontWeight: 'bold',
    components: null,
    subItems: [
      {
        id: 'Observation',
        title: CriteriaTypeLabels.OBSERVATION,
        color: !!ODD_BIOLOGY ? '#0063AF' : '#808080',
        fontWeight: 'normal',
        components: !!ODD_BIOLOGY ? BiologyForm : null,
        disabled: !!!ODD_BIOLOGY ?? false,
        fetch: {
          biologyData: services.cohortCreation.fetchBiologyData,
          encounterStatus: services.cohortCreation.fetchEncounterStatus
        }
      },
      {
        id: 'microbiologie',
        title: CriteriaTypeLabels.MICROBIOLOGIE,
        components: null,
        color: '#808080',
        fontWeight: 'normal',
        disabled: true
      }
    ]
  },
  {
    id: 'Speciality',
    title: 'Dossiers de spécialité',
    color: '#0063AF',
    fontWeight: 'bold',
    components: null,
    subItems: [
      {
        id: 'Maternity',
        title: 'Maternité',
        components: null,
        color: '#0063AF',
        fontWeight: 'normal',
        disabled: false,
        subItems: [
          {
            id: CriteriaType.PREGNANCY,
            title: 'Fiche Grossesse',
            color: '#0063AF',
            fontWeight: 'normal',
            disabled: false,
            components: PregnantForm,
            fetch: {
              pregnancyMode: services.cohortCreation.fetchPregnancyMode,
              maternalRisks: services.cohortCreation.fetchMaternalRisks,
              risksRelatedToObstetricHistory: services.cohortCreation.fetchRisksRelatedToObstetricHistory,
              risksOrComplicationsOfPregnancy: services.cohortCreation.fetchRisksOrComplicationsOfPregnancy,
              corticotherapie: services.cohortCreation.fetchCorticotherapie,
              prenatalDiagnosis: services.cohortCreation.fetchPrenatalDiagnosis,
              ultrasoundMonitoring: services.cohortCreation.fetchUltrasoundMonitoring,
              encounterStatus: services.cohortCreation.fetchEncounterStatus
            }
          },
          {
            id: 'Hospit',
            title: 'Hospitalisation',
            color: '#0063AF',
            fontWeight: 'normal',
            disabled: false,
            components: HospitForm,
            fetch: {
              inUteroTransfer: services.cohortCreation.fetchInUteroTransfer,
              pregnancyMonitoring: services.cohortCreation.fetchPregnancyMonitoring,
              maturationCorticotherapie: services.cohortCreation.fetchMaturationCorticotherapie,
              chirurgicalGesture: services.cohortCreation.fetchChirurgicalGesture,
              vme: services.cohortCreation.fetchVme,
              childbirth: services.cohortCreation.fetchChildbirth,
              hospitalChildBirthPlace: services.cohortCreation.fetchHospitalChildBirthPlace,
              otherHospitalChildBirthPlace: services.cohortCreation.fetchOtherHospitalChildBirthPlace,
              homeChildBirthPlace: services.cohortCreation.fetchHomeChildBirthPlace,
              childbirthMode: services.cohortCreation.fetchChildbirthMode,
              maturationReason: services.cohortCreation.fetchMaturationReason,
              maturationModality: services.cohortCreation.fetchMaturationModality,
              imgIndication: services.cohortCreation.fetchImgIndication,
              laborOrCesareanEntry: services.cohortCreation.fetchLaborOrCesareanEntry,
              pathologyDuringLabor: services.cohortCreation.fetchPathologyDuringLabor,
              obstetricalGestureDuringLabor: services.cohortCreation.fetchObstetricalGestureDuringLabor,
              analgesieType: services.cohortCreation.fetchAnalgesieType,
              birthDeliveryWay: services.cohortCreation.fetchBirthDeliveryWay,
              instrumentType: services.cohortCreation.fetchInstrumentType,
              cSectionModality: services.cohortCreation.fetchCSectionModality,
              presentationAtDelivery: services.cohortCreation.fetchPresentationAtDelivery,
              birthStatus: services.cohortCreation.fetchBirthStatus,
              postpartumHemorrhage: services.cohortCreation.fetchSetPostpartumHemorrhage,
              conditionPerineum: services.cohortCreation.fetchConditionPerineum,
              exitPlaceType: services.cohortCreation.fetchExitPlaceType,
              feedingType: services.cohortCreation.fetchFeedingType,
              complication: services.cohortCreation.fetchComplication,
              exitFeedingMode: services.cohortCreation.fetchExitFeedingMode,
              exitDiagnostic: services.cohortCreation.fetchExitDiagnostic,
              encounterStatus: services.cohortCreation.fetchEncounterStatus
            }
          }
        ]
      }
    ]
  },
  {
    id: 'ImagingStudy',
    title: CriteriaTypeLabels.IMAGING,
    color: ODD_IMAGING ? '#0063AF' : '#808080',
    fontWeight: 'bold',
    components: ODD_IMAGING ? ImagingForm : null,
    disabled: !ODD_IMAGING ?? false,
    fetch: {
      modalities: services.cohortCreation.fetchModalities,
      encounterStatus: services.cohortCreation.fetchEncounterStatus
    }
  },
  {
    id: 'physiologie',
    title: CriteriaTypeLabels.PHYSIOLOGIE,
    color: '#808080',
    fontWeight: 'bold',
    disabled: true,
    components: null
  }
]

export default criteriaList
