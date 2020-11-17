import { CriteriaItemType } from 'types'

// Components
import DemographicFrom from './DiagramView/components/CriteriaCard/components/DemographicFrom/DemographicFrom'
import DocumentsForm from './DiagramView/components/CriteriaCard/components/DocumentsForm/DocumentsForm'
import SupportedForm from './DiagramView/components/CriteriaCard/components/SupportedForm/SupportedForm'
import CCAMForm from './DiagramView/components/CriteriaCard/components/CCAMForm/CCAMForm'
import Cim10Form from './DiagramView/components/CriteriaCard/components/Cim10Form/Cim10Form'
import GhmForm from './DiagramView/components/CriteriaCard/components/GhmForm/GhmForm'

// Data
import cimData from '../../../data/Requeteur/CIM10/cim9_data'
// import admissionMode from '../../../data/Requeteur/VISITE/admissionMode'
// import entryMode from '../../../data/Requeteur/VISITE/entryMode'
// import exitMode from '../../../data/Requeteur/VISITE/exitMode'
import ccamData from '../../../data/ccam_data'
import ghmData from '../../../data/ghm_data'

// Fetcher
import {
  fetchAdmissionModes,
  fetchEntryModes,
  fetchExitModes,
  fetchFileStatus
} from '../../../data/Requeteur/encounter'
import { fetchGender, fetchStatus } from '../../../data/Requeteur/patient'

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
    data: { gender: 'loading', deceased: 'loading' },
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
    id: 'documents_cliniques',
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
        id: 'diagnostics',
        title: 'Diagnostics',
        color: '#0063AF',
        components: Cim10Form,
        data: cimData,
        fetch: {}
      },
      {
        id: 'actes',
        title: 'Actes',
        color: '#0063AF',
        components: CCAMForm,
        data: ccamData
      },
      {
        id: 'ghm',
        title: 'GHM',
        color: '#0063AF',
        components: GhmForm,
        data: ghmData
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
        components: null,
        color: '#0063AF'
      },
      {
        id: 'microbiologie',
        title: 'Microbiologie',
        components: null,
        color: '#0063AF'
      }
    ]
  },
  {
    id: 'physiologie',
    title: 'Physiologie',
    color: '#0063AF',
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
        color: '#0063AF'
      }
    ]
  }
]

const constructCriteriaList: () => CriteriaItemType[] = () => criteriaList

export default constructCriteriaList
