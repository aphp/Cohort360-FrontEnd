import { CriteriaItemType } from 'types'

import RequestForm from './DiagramView/components/LogicalOperator/components/CriteriaRightPanel/RequestForm/RequestForm'

import { CriteriaType } from 'types/requestCriterias'
import { getConfig } from 'config'
import { form as ghmForm } from './DiagramView/components/LogicalOperator/components/CriteriaRightPanel/forms/GHMForm'
import { form as hospitForm } from './DiagramView/components/LogicalOperator/components/CriteriaRightPanel/forms/HospitForm'
import { form as imagingForm } from './DiagramView/components/LogicalOperator/components/CriteriaRightPanel/forms/ImagingForm'
import { form as cim10Form } from './DiagramView/components/LogicalOperator/components/CriteriaRightPanel/forms/Cim10Form'
import { form as ccamForm } from './DiagramView/components/LogicalOperator/components/CriteriaRightPanel/forms/CCAMForm'
import { form as demographicForm } from './DiagramView/components/LogicalOperator/components/CriteriaRightPanel/forms/DemographicForm'
import { form as encounterForm } from './DiagramView/components/LogicalOperator/components/CriteriaRightPanel/forms/EncounterForm'
import { form as documentsForm } from './DiagramView/components/LogicalOperator/components/CriteriaRightPanel/forms/DocumentsForm'
import { form as biologyForm } from './DiagramView/components/LogicalOperator/components/CriteriaRightPanel/forms/BiologyForm'
import { form as pregnantForm } from './DiagramView/components/LogicalOperator/components/CriteriaRightPanel/forms/PregnancyForm'
import { form as medicationForm } from './DiagramView/components/LogicalOperator/components/CriteriaRightPanel/forms/MedicationForm'
import { form as ippForm } from './DiagramView/components/LogicalOperator/components/CriteriaRightPanel/forms/IPPForm'

export enum CriteriaTypeLabels {
  REQUEST = 'Mes requêtes',
  IPP_LIST = "Liste d'IPP",
  PATIENT = 'Démographie',
  ENCOUNTER = 'Prise en charge',
  DOCUMENTS = 'Documents cliniques',
  PMSI = 'PMSI',
  CONDITION = 'Diagnostics',
  PROCEDURE = 'Actes',
  CLAIM = 'GHM',
  MEDICATION = 'Médicaments',
  BIO_MICRO = 'Biologie/Microbiologie',
  OBSERVATION = 'Biologie',
  MICROBIOLOGIE = 'Microbiologie',
  PHYSIOLOGIE = 'Physiologie',
  IMAGING = 'Imagerie',
  PREGNANCY = 'Fiche grossesse',
  HOSPIT = "Fiche d'hospitalisation"
}

const criteriaList: () => CriteriaItemType[] = () => {
  const ODD_QUESTIONNAIRE = getConfig().features.questionnaires.enabled
  const ODD_BIOLOGY = getConfig().features.observation.enabled
  const ODD_IMAGING = getConfig().features.imaging.enabled
  const ODD_MEDICATION = getConfig().features.medication.enabled
  const ODD_DOCUMENT_REFERENCE = getConfig().features.documentReference.enabled
  return [
    {
      id: CriteriaType.REQUEST,
      title: CriteriaTypeLabels.REQUEST,
      color: '#0063AF',
      fontWeight: 'bold',
      component: RequestForm
    },
    {
      id: CriteriaType.IPP_LIST,
      title: CriteriaTypeLabels.IPP_LIST,
      color: '#0063AF',
      fontWeight: 'bold',
      formDefinition: ippForm(),
      disabled: true
    },
    {
      id: CriteriaType.PATIENT,
      title: CriteriaTypeLabels.PATIENT,
      color: '#0063AF',
      fontWeight: 'bold',
      formDefinition: demographicForm()
    },
    {
      id: CriteriaType.ENCOUNTER,
      title: CriteriaTypeLabels.ENCOUNTER,
      color: '#0063AF',
      fontWeight: 'bold',
      formDefinition: encounterForm()
    },
    {
      id: CriteriaType.DOCUMENTS,
      title: CriteriaTypeLabels.DOCUMENTS,
      color: ODD_DOCUMENT_REFERENCE ? '#0063AF' : '#808080',
      disabled: !ODD_DOCUMENT_REFERENCE,
      fontWeight: 'bold',
      formDefinition: documentsForm()
    },
    {
      id: CriteriaType.PMSI,
      title: CriteriaTypeLabels.PMSI,
      color: '#0063AF',
      fontWeight: 'bold',
      subItems: [
        {
          id: CriteriaType.CONDITION,
          title: CriteriaTypeLabels.CONDITION,
          color: '#0063AF',
          fontWeight: 'normal',
          formDefinition: cim10Form()
        },
        {
          id: CriteriaType.PROCEDURE,
          title: CriteriaTypeLabels.PROCEDURE,
          color: '#0063AF',
          fontWeight: 'normal',
          formDefinition: ccamForm()
        },
        {
          id: CriteriaType.CLAIM,
          title: CriteriaTypeLabels.CLAIM,
          color: '#808080',
          fontWeight: 'normal',
          formDefinition: ghmForm(),
          disabled: true
        }
      ]
    },
    {
      id: CriteriaType.MEDICATION,
      types: [CriteriaType.MEDICATION_REQUEST, CriteriaType.MEDICATION_ADMINISTRATION],
      title: 'Médicaments (Prescription - Administration)',
      color: ODD_MEDICATION ? '#0063AF' : '#808080',
      fontWeight: 'bold',
      formDefinition: medicationForm(),
      disabled: !ODD_MEDICATION
    },
    {
      id: CriteriaType.BIO_MICRO,
      title: CriteriaTypeLabels.BIO_MICRO,
      color: ODD_BIOLOGY ? '#0063AF' : '#808080',
      fontWeight: 'bold',
      subItems: [
        {
          id: CriteriaType.OBSERVATION,
          title: CriteriaTypeLabels.OBSERVATION,
          color: ODD_BIOLOGY ? '#0063AF' : '#808080',
          fontWeight: 'normal',
          formDefinition: biologyForm(),
          disabled: !ODD_BIOLOGY
        },
        {
          id: CriteriaType.MICROBIOLOGIE,
          title: CriteriaTypeLabels.MICROBIOLOGIE,
          color: '#808080',
          fontWeight: 'normal',
          disabled: true
        }
      ]
    },
    {
      id: CriteriaType.SPECIALITY,
      title: 'Dossiers de spécialité',
      color: '#0063AF',
      fontWeight: 'bold',
      subItems: [
        {
          id: CriteriaType.MATERNITY,
          title: 'Maternité',
          color: '#0063AF',
          fontWeight: 'normal',
          subItems: [
            {
              id: CriteriaType.PREGNANCY,
              title: 'Fiche Grossesse',
              color: ODD_QUESTIONNAIRE ? '#0063AF' : '#808080',
              fontWeight: 'normal',
              disabled: !ODD_QUESTIONNAIRE,
              formDefinition: pregnantForm()
            },
            {
              id: CriteriaType.HOSPIT,
              title: 'Hospitalisation',
              color: ODD_QUESTIONNAIRE ? '#0063AF' : '#808080',
              fontWeight: 'normal',
              disabled: !ODD_QUESTIONNAIRE,
              formDefinition: hospitForm()
            }
          ]
        }
      ]
    },
    {
      id: CriteriaType.IMAGING,
      title: CriteriaTypeLabels.IMAGING,
      color: ODD_IMAGING ? '#0063AF' : '#808080',
      fontWeight: 'bold',
      formDefinition: imagingForm(),
      disabled: !ODD_IMAGING
    },
    {
      id: CriteriaType.PHYSIOLOGIE,
      title: CriteriaTypeLabels.PHYSIOLOGIE,
      color: '#808080',
      fontWeight: 'bold',
      disabled: true
    }
  ]
}

export const getAllCriteriaItems = (criteria: readonly CriteriaItemType[]): CriteriaItemType[] => {
  const allCriteriaItems: CriteriaItemType[] = []
  for (const criterion of criteria) {
    allCriteriaItems.push(criterion)
    if (criterion.subItems && criterion.subItems.length > 0) {
      allCriteriaItems.push(...getAllCriteriaItems(criterion.subItems))
    }
  }
  return allCriteriaItems
}

export default criteriaList
