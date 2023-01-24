import { CriteriaItemType } from 'types'

// Components
import RequestForm from './DiagramView/components/LogicalOperator/components/CriteriaRightPanel/RequestForm/RequestForm'
import IPPForm from './DiagramView/components/LogicalOperator/components/CriteriaRightPanel/IPPForm/IPPForm'
import DemographicFrom from './DiagramView/components/LogicalOperator/components/CriteriaRightPanel/DemographicFrom/DemographicFrom'
import DocumentsForm from './DiagramView/components/LogicalOperator/components/CriteriaRightPanel/DocumentsForm/DocumentsForm'
import SupportedForm from './DiagramView/components/LogicalOperator/components/CriteriaRightPanel/SupportedForm/SupportedForm'
import CCAMForm from './DiagramView/components/LogicalOperator/components/CriteriaRightPanel/CCAM'
import Cim10Form from './DiagramView/components/LogicalOperator/components/CriteriaRightPanel/Cim10Form'
import GhmForm from './DiagramView/components/LogicalOperator/components/CriteriaRightPanel/GHM'
import MedicationForm from './DiagramView/components/LogicalOperator/components/CriteriaRightPanel/MedicationForm'
import BiologyForm from './DiagramView/components/LogicalOperator/components/CriteriaRightPanel/BiologyForm'

import services from 'services'

import { ODD_BIOLOGY, ODD_MEDICATION } from '../../constants'

// ├── Mes variables
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
    id: 'Request',
    title: 'Mes requêtes',
    color: '#0063AF',
    components: RequestForm
  },
  {
    id: 'IPPList',
    title: "Liste d'IPP",
    color: '#0063AF',
    components: IPPForm,
    disabled: true
  },
  {
    id: 'Patient',
    title: 'Démographie',
    color: '#0063AF',
    components: DemographicFrom,
    data: { gender: 'loading', status: 'loading' },
    fetch: { fetchGender: services.cohortCreation.fetchGender, fetchStatus: services.cohortCreation.fetchStatus }
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
      fetchAdmissionModes: services.cohortCreation.fetchAdmissionModes,
      fetchEntryModes: services.cohortCreation.fetchEntryModes,
      fetchExitModes: services.cohortCreation.fetchExitModes,
      fetchPriseEnChargeType: services.cohortCreation.fetchPriseEnChargeType,
      fetchTypeDeSejour: services.cohortCreation.fetchTypeDeSejour,
      fetchFileStatus: services.cohortCreation.fetchFileStatus,
      fetchReason: services.cohortCreation.fetchReason,
      fetchDestination: services.cohortCreation.fetchDestination,
      fetchProvenance: services.cohortCreation.fetchProvenance,
      fetchAdmission: services.cohortCreation.fetchAdmission
    }
  },
  {
    id: 'Composition',
    title: 'Documents cliniques',
    color: '#0063AF',
    components: DocumentsForm,
    data: { docTypes: 'loading' },
    fetch: { fetchDocTypes: services.cohortCreation.fetchDocTypes }
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
        fetch: {
          fetchStatusDiagnostic: services.cohortCreation.fetchStatusDiagnostic,
          fetchDiagnosticTypes: services.cohortCreation.fetchDiagnosticTypes,
          fetchCim10Diagnostic: services.cohortCreation.fetchCim10Diagnostic,
          fetchCim10Hierarchy: services.cohortCreation.fetchCim10Hierarchy
        }
      },
      {
        id: 'Procedure',
        title: 'Actes',
        color: '#0063AF',
        components: CCAMForm,
        data: { ccamData: 'loading', ccamHierarchy: 'loading' },
        fetch: {
          fetchCcamData: services.cohortCreation.fetchCcamData,
          fetchCcamHierarchy: services.cohortCreation.fetchCcamHierarchy
        }
      },
      {
        id: 'Claim',
        title: 'GHM',
        color: '#0063AF',
        components: GhmForm,
        data: { ghmData: 'loading', ghmHierarchy: 'loading' },
        fetch: {
          fetchGhmData: services.cohortCreation.fetchGhmData,
          fetchGhmHierarchy: services.cohortCreation.fetchGhmHierarchy
        }
      }
    ]
  },
  {
    id: 'Medication',
    // title: 'Médicaments (Prescription - Dispension - Administration)',
    title: 'Médicaments (Prescription - Administration)',
    color: ODD_MEDICATION ? '#0063AF' : '#808080',
    components: ODD_MEDICATION ? MedicationForm : null,
    disabled: !ODD_MEDICATION ?? false,
    data: { atcData: 'loading', atcHierarchy: 'loading', prescriptionTypes: 'loading', administrations: 'loading' },
    fetch: {
      fetchAtcData: services.cohortCreation.fetchAtcData,
      fetchAtcHierarchy: services.cohortCreation.fetchAtcHierarchy,
      fetchPrescriptionTypes: services.cohortCreation.fetchPrescriptionTypes,
      fetchAdministrations: services.cohortCreation.fetchAdministrations
    }
  },
  {
    id: 'biologie_microbiologie',
    title: 'Biologie/Microbiologie',
    color: !!ODD_BIOLOGY ? '#0063AF' : '#808080',
    components: null,
    subItems: [
      {
        id: 'Observation',
        title: 'Biologie',
        color: !!ODD_BIOLOGY ? '#0063AF' : '#808080',
        components: !!ODD_BIOLOGY ? BiologyForm : null,
        disabled: !!!ODD_BIOLOGY ?? false,
        data: { biologyData: 'loading', biologyHierarchy: 'loading' },
        fetch: {
          fetchBiologyData: services.cohortCreation.fetchBiologyData,
          fetchBiologyHierarchy: services.cohortCreation.fetchBiologyHierarchy,
          fetchBiologySearch: services.cohortCreation.fetchBiologySearch
        }
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
