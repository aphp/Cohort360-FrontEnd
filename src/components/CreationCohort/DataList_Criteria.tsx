import { CriteriaItemType } from 'types'

// Components
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

import services from 'services/aphp'

import { ODD_BIOLOGY, ODD_IMAGING, ODD_MEDICATION } from '../../constants'

// ├── Mes requêtes
// ├── Liste d'IPP
// ├── Patients
// ├── Visites
// ├── Documents cliniques
// ├── PMSI
// │   ├── Diagnostics
// │   ├── Actes
// │   ├── GHM
// ├── Médicaments
// │   ├── Prescription - Dispension - Administration
// ├── Biologie/Microbiologie
// │   ├── Biologie
// │   ├── Microbiologie
// ├── Imagerie
// ├── Physiologie

const criteriaList: CriteriaItemType[] = [
  {
    id: 'Request',
    title: 'Mes requêtes',
    color: '#0063AF',
    fontWeight: 'bold',
    components: RequestForm
  },
  {
    id: 'IPPList',
    title: "Liste d'IPP",
    color: '#0063AF',
    fontWeight: 'bold',
    components: IPPForm,
    disabled: true
  },
  {
    id: 'Patient',
    title: 'Démographie',
    color: '#0063AF',
    fontWeight: 'bold',
    components: DemographicForm,
    fetch: { gender: services.cohortCreation.fetchGender, status: services.cohortCreation.fetchStatus }
  },
  {
    id: 'Encounter',
    title: 'Prise en charge',
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
      admission: services.cohortCreation.fetchAdmission
    }
  },
  {
    id: 'DocumentReference',
    title: 'Documents cliniques',
    color: '#0063AF',
    fontWeight: 'bold',
    components: DocumentsForm,
    fetch: { docTypes: services.cohortCreation.fetchDocTypes }
  },
  {
    id: 'pmsi',
    title: 'PMSI',
    color: '#0063AF',
    fontWeight: 'bold',
    components: null,
    subItems: [
      {
        id: 'Condition',
        title: 'Diagnostics',
        color: '#0063AF',
        fontWeight: 'normal',
        components: Cim10Form,
        fetch: {
          statusDiagnostic: services.cohortCreation.fetchStatusDiagnostic,
          diagnosticTypes: services.cohortCreation.fetchDiagnosticTypes,
          cim10Diagnostic: services.cohortCreation.fetchCim10Diagnostic
        }
      },
      {
        id: 'Procedure',
        title: 'Actes',
        color: '#0063AF',
        fontWeight: 'normal',
        components: CCAMForm,
        fetch: {
          ccamData: services.cohortCreation.fetchCcamData
        }
      },
      {
        id: 'Claim',
        title: 'GHM',
        color: '#0063AF',
        fontWeight: 'normal',
        components: GhmForm,
        fetch: {
          ghmData: services.cohortCreation.fetchGhmData
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
      administrations: services.cohortCreation.fetchAdministrations
    }
  },
  {
    id: 'biologie_microbiologie',
    title: 'Biologie/Microbiologie',
    color: !!ODD_BIOLOGY ? '#0063AF' : '#808080',
    fontWeight: 'bold',
    components: null,
    subItems: [
      {
        id: 'Observation',
        title: 'Biologie',
        color: !!ODD_BIOLOGY ? '#0063AF' : '#808080',
        fontWeight: 'normal',
        components: !!ODD_BIOLOGY ? BiologyForm : null,
        disabled: !!!ODD_BIOLOGY ?? false,
        fetch: {
          biologyData: services.cohortCreation.fetchBiologyData
        }
      },
      {
        id: 'microbiologie',
        title: 'Microbiologie',
        components: null,
        color: '#808080',
        fontWeight: 'normal',
        disabled: true
      }
    ]
  },
  {
    id: 'ImagingStudy',
    title: 'Imagerie',
    color: ODD_IMAGING ? '#0063AF' : '#808080',
    fontWeight: 'bold',
    components: ODD_IMAGING ? ImagingForm : null,
    disabled: !ODD_IMAGING ?? false,
    data: { modalities: 'loading' },
    fetch: {
      fetchModalities: services.cohortCreation.fetchModalities
    }
  },
  {
    id: 'physiologie',
    title: 'Physiologie',
    color: '#808080',
    fontWeight: 'bold',
    disabled: true,
    components: null
  }
]

export default criteriaList
