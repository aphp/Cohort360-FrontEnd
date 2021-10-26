import { CriteriaItemType } from 'types'

// Components
import DemographicFrom from './DiagramView/components/LogicalOperator/components/CriteriaRightPanel/DemographicFrom/DemographicFrom'
import DocumentsForm from './DiagramView/components/LogicalOperator/components/CriteriaRightPanel/DocumentsForm/DocumentsForm'
import SupportedForm from './DiagramView/components/LogicalOperator/components/CriteriaRightPanel/SupportedForm/SupportedForm'
import CCAMForm from './DiagramView/components/LogicalOperator/components/CriteriaRightPanel/CCAM'
import Cim10Form from './DiagramView/components/LogicalOperator/components/CriteriaRightPanel/Cim10Form'
import GhmForm from './DiagramView/components/LogicalOperator/components/CriteriaRightPanel/GHM'
import MedicationForm from './DiagramView/components/LogicalOperator/components/CriteriaRightPanel/MedicationForm'

// Fetcher
import {
  fetchAdmissionModes,
  fetchEntryModes,
  fetchExitModes,
  fetchPriseEnChargeType,
  fetchTypeDeSejour,
  fetchFileStatus,
  fetchReason,
  fetchDestination,
  fetchProvenance,
  fetchAdmission
} from 'services/cohortCreation/fetchEncounter'
import { fetchGender, fetchStatus } from 'services/cohortCreation/fetchDemographic'
import {
  fetchStatusDiagnostic,
  fetchDiagnosticTypes,
  fetchCim10Diagnostic,
  fetchCim10Hierarchy
} from 'services/cohortCreation/fetchCondition'
import { fetchCcamData, fetchCcamHierarchy } from 'services/cohortCreation/fetchProcedure'
import { fetchGhmData, fetchGhmHierarchy } from 'services/cohortCreation/fetchClaim'
import { fetchDocTypes } from 'services/cohortCreation/fetchComposition'
import {
  fetchAtcData,
  fetchAtcHierarchy,
  fetchPrescriptionTypes,
  fetchAdministrations
} from 'services/cohortCreation/fetchMedication'

// ├── Mes variables
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
// ├── Physiologie

const criteriaList: CriteriaItemType[] = [
  {
    id: 'mes_variables',
    title: 'Mes variables',
    color: '#808080',
    disabled: true,
    data: null,
    components: null
  },
  {
    id: 'Patient',
    title: 'Démographie',
    color: '#0063AF',
    components: DemographicFrom,
    data: { gender: 'loading', status: 'loading' },
    fetch: { fetchGender, fetchStatus }
  },
  {
    id: 'Encounter',
    title: 'Prise en charge',
    color: '#0063AF',
    components: SupportedForm,
    data: {
      admissionModes: 'loading',
      entryModes: 'loading',
      exitModes: 'loading',
      priseEnChargeType: 'loading',
      typeDeSejour: 'loading',
      fileStatus: 'loading',
      reason: 'loading',
      destination: 'loading',
      provenance: 'loading',
      admission: 'loading'
    },
    fetch: {
      fetchAdmissionModes,
      fetchEntryModes,
      fetchExitModes,
      fetchPriseEnChargeType,
      fetchTypeDeSejour,
      fetchFileStatus,
      fetchReason,
      fetchDestination,
      fetchProvenance,
      fetchAdmission
    }
  },
  {
    id: 'Composition',
    title: 'Documents cliniques',
    color: '#0063AF',
    components: DocumentsForm,
    data: { docTypes: 'loading' },
    fetch: { fetchDocTypes }
  },
  {
    id: 'pmsi',
    title: 'PMSI',
    color: '#0063AF',
    components: null,
    subItems: [
      {
        id: 'Condition',
        title: 'Diagnostics',
        color: '#0063AF',
        components: Cim10Form,
        data: {
          statusDiagnostic: 'loading',
          diagnosticTypes: 'loading',
          cim10Diagnostic: 'loading',
          cim10Hierarchy: 'loading'
        },
        fetch: { fetchStatusDiagnostic, fetchDiagnosticTypes, fetchCim10Diagnostic, fetchCim10Hierarchy }
      },
      {
        id: 'Procedure',
        title: 'Actes',
        color: '#0063AF',
        components: CCAMForm,
        data: { ccamData: 'loading', ccamHierarchy: 'loading' },
        fetch: { fetchCcamData, fetchCcamHierarchy }
      },
      {
        id: 'Claim',
        title: 'GHM',
        color: '#0063AF',
        components: GhmForm,
        data: { ghmData: 'loading', ghmHierarchy: 'loading' },
        fetch: { fetchGhmData, fetchGhmHierarchy }
      }
    ]
  },
  {
    id: 'Medication',
    // title: 'Médicaments (Prescription - Dispension - Administration)',
    title: 'Médicaments (Prescription - Administration)',
    color: '#0063AF',
    components: MedicationForm,
    data: { atcData: 'loading', atcHierarchy: 'loading', prescriptionTypes: 'loading', administrations: 'loading' },
    fetch: { fetchAtcData, fetchAtcHierarchy, fetchPrescriptionTypes, fetchAdministrations }
  },
  {
    id: 'biologie_microbiologie',
    title: 'Biologie/Microbiologie',
    color: '#808080',
    components: null,
    subItems: [
      {
        id: 'biologie',
        title: 'Biologie',
        color: '#808080',
        disabled: true,
        data: null,
        components: null
      },
      {
        id: 'microbiologie',
        title: 'Microbiologie',
        components: null,
        color: '#808080',
        disabled: true,
        data: null
      }
    ]
  },
  {
    id: 'physiologie',
    title: 'Physiologie',
    color: '#808080',
    disabled: true,
    data: null,
    components: null
  }
]

const constructCriteriaList: () => CriteriaItemType[] = () => criteriaList

export default constructCriteriaList
