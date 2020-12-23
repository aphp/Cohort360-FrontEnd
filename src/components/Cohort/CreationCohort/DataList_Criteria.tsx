import { CriteriaItemType } from 'types'

// Components
import DemographicFrom from './DiagramView/components/CriteriaCard/components/DemographicFrom/DemographicFrom'
import DocumentsForm from './DiagramView/components/CriteriaCard/components/DocumentsForm/DocumentsForm'
import SupportedForm from './DiagramView/components/CriteriaCard/components/SupportedForm/SupportedForm'
import CCAMForm from './DiagramView/components/CriteriaCard/components/CCAM/index'
import Cim10Form from './DiagramView/components/CriteriaCard/components/Cim10Form'
import GhmForm from './DiagramView/components/CriteriaCard/components/GhmForm/GhmForm'

// Fetcher
import {
  fetchAdmissionModes,
  fetchEntryModes,
  fetchExitModes,
  fetchFileStatus
} from '../../../services/cohortCreation/fetchEncounter'
import { fetchGender, fetchStatus } from '../../../services/cohortCreation/fetchDemographic'
import {
  fetchStatusDiagnostic,
  fetchDiagnosticTypes,
  fetchCim10Diagnostic,
  fetchCim10Hierarchy
} from '../../../services/cohortCreation/fetchCondition'
import { fetchCcamData } from '../../../services/cohortCreation/fetchProcedure'
import { fetchGhmData } from '../../../services/cohortCreation/fetchClaim'

// ├── Mes variables
// ├── Patients
// ├── Visites
// ├── Documents cliniques
// ├── PMSI
// │   ├── Diagnostics
// │   ├── Actes
// │   ├── GHM
// ├── Biologie/Microbiologie
// │   ├── Biologie
// │   ├── Microbiologie
// ├── Physiologie
// ├── Médicaments
// │   ├── Prescription - Dispension - Administration

const criteriaList: CriteriaItemType[] = [
  {
    id: 'mes_variables',
    title: 'Mes variables',
    color: '#5BC5F2',
    disabled: true,
    data: null,
    components: null
  },
  {
    id: 'Patient',
    title: 'Patients',
    color: '#0063AF',
    components: DemographicFrom,
    data: { gender: 'loading', status: 'loading' },
    fetch: { fetchGender, fetchStatus }
  },
  {
    id: 'Encounter',
    title: 'Visites',
    color: '#0063AF',
    components: SupportedForm,
    data: { admissionModes: 'loading', entryModes: 'loading', exitModes: 'loading', fileStatus: 'loading' },
    fetch: { fetchAdmissionModes, fetchEntryModes, fetchExitModes, fetchFileStatus }
  },
  {
    id: 'Composition',
    title: 'Documents cliniques',
    color: '#0063AF',
    components: DocumentsForm
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
        data: { statusDiagnostic: 'loading', diagnosticTypes: 'loading', cim10Diagnostic: 'loading' },
        fetch: { fetchStatusDiagnostic, fetchDiagnosticTypes, fetchCim10Diagnostic, fetchCim10Hierarchy }
      },
      {
        id: 'Procedure',
        title: 'Actes',
        color: '#0063AF',
        components: CCAMForm,
        data: { ccamData: 'loading' },
        fetch: { fetchCcamData }
      },
      {
        id: 'Claim',
        title: 'GHM',
        color: '#0063AF',
        components: GhmForm,
        data: { ghmData: 'loading' },
        fetch: { fetchGhmData }
      }
    ]
  },
  {
    id: 'biologie_microbiologie',
    title: 'Biologie/Microbiologie',
    color: '#0063AF',
    components: null,
    subItems: [
      {
        id: 'biologie',
        title: 'Biologie',
        color: '#0063AF',
        disabled: true,
        data: null,
        components: null
      },
      {
        id: 'microbiologie',
        title: 'Microbiologie',
        components: null,
        color: '#0063AF',
        disabled: true,
        data: null
      }
    ]
  },
  {
    id: 'physiologie',
    title: 'Physiologie',
    color: '#0063AF',
    disabled: true,
    data: null,
    components: null
  },
  {
    id: 'médicaments',
    title: 'Médicaments',
    color: '#0063AF',
    components: null,
    subItems: [
      {
        id: 'prescription_dispension_administration',
        title: 'Prescription - Dispension - Administration',
        components: null,
        color: '#0063AF',
        disabled: true,
        data: null
      }
    ]
  }
]

const constructCriteriaList: () => CriteriaItemType[] = () => criteriaList

export default constructCriteriaList
