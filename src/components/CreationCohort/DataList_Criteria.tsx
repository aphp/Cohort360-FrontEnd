import { Back_API_Response, CriteriaItemType } from 'types'

import RequestForm from './DiagramView/components/LogicalOperator/components/CriteriaRightPanel/RequestForm/RequestForm'
import IPPForm from './DiagramView/components/LogicalOperator/components/CriteriaRightPanel/IPPForm/IPPForm'
import DocumentsForm from './DiagramView/components/LogicalOperator/components/CriteriaRightPanel/DocumentsForm'
import EncounterForm from './DiagramView/components/LogicalOperator/components/CriteriaRightPanel/EncounterForm'
import CCAMForm from './DiagramView/components/LogicalOperator/components/CriteriaRightPanel/CcamForm'
import Cim10Form from './DiagramView/components/LogicalOperator/components/CriteriaRightPanel/Cim10Form'
import GhmForm from './DiagramView/components/LogicalOperator/components/CriteriaRightPanel/GHMForm'
import MedicationForm from './DiagramView/components/LogicalOperator/components/CriteriaRightPanel/MedicationForm'
import BiologyForm from './DiagramView/components/LogicalOperator/components/CriteriaRightPanel/BiologyForm'
import DemographicForm from './DiagramView/components/LogicalOperator/components/CriteriaRightPanel/DemographicForm'
import ImagingForm from './DiagramView/components/LogicalOperator/components/CriteriaRightPanel/ImagingForm'
import PregnantForm from './DiagramView/components/LogicalOperator/components/CriteriaRightPanel/PregnantForm'
import HospitForm from './DiagramView/components/LogicalOperator/components/CriteriaRightPanel/HospitForm'

import { CriteriaType, CriteriaTypeLabels } from 'types/requestCriterias'
import { getConfig } from 'config'
import { HIERARCHY_ROOT, getChildrenFromCodes, getCodeList } from 'services/aphp/serviceValueSets'

import docTypes from 'assets/docTypes.json'
import { birthStatusData, booleanFieldsData, booleanOpenChoiceFieldsData, vmeData } from 'data/questionnaire_data'
import { VitalStatusLabel } from 'types/searchCriterias'
import { FhirItem } from 'types/valueSet'
import { createHierarchyRoot } from 'utils/hierarchy'

const async = (fetch: () => Promise<Back_API_Response<FhirItem>>) => async () => (await fetch()).results

const getCodesForValueSet = async (code: string, systems: string[]) => {
  if (code === HIERARCHY_ROOT && systems.length) return [createHierarchyRoot(systems[0])]
  for (const system of systems) {
    try {
      return (await getChildrenFromCodes(system, [code])).results
    } catch {
      console.error("Ce n'est pas une erreur.")
    }
  }
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
      components: RequestForm
    },
    {
      id: CriteriaType.IPP_LIST,
      title: CriteriaTypeLabels.IPP_LIST,
      color: '#0063AF',
      fontWeight: 'bold',
      components: IPPForm,
      disabled: true
    },
    {
      id: CriteriaType.PATIENT,
      title: CriteriaTypeLabels.PATIENT,
      color: '#0063AF',
      fontWeight: 'bold',
      components: DemographicForm,
      fetch: {
        gender: async(() => getCodeList(getConfig().core.valueSets.demographicGender.url)),
        status: () => [
          {
            id: 'false',
            label: VitalStatusLabel.ALIVE,
            system: 'status'
          },
          {
            id: 'true',
            label: VitalStatusLabel.DECEASED,
            system: 'status'
          }
        ]
      }
    },
    {
      id: CriteriaType.ENCOUNTER,
      title: CriteriaTypeLabels.ENCOUNTER,
      color: '#0063AF',
      fontWeight: 'bold',
      components: EncounterForm,
      fetch: {
        admissionModes: async(() => getCodeList(getConfig().core.valueSets.encounterAdmissionMode.url)),
        entryModes: async(() => getCodeList(getConfig().core.valueSets.encounterEntryMode.url)),
        exitModes: async(() => getCodeList(getConfig().core.valueSets.encounterExitMode.url)),
        priseEnChargeType: async(() => getCodeList(getConfig().core.valueSets.encounterVisitType.url)),
        typeDeSejour: async(() => getCodeList(getConfig().core.valueSets.encounterSejourType.url)),
        fileStatus: async(() => getCodeList(getConfig().core.valueSets.encounterFileStatus.url)),
        reason: async(() => getCodeList(getConfig().core.valueSets.encounterExitType.url)),
        destination: async(() => getCodeList(getConfig().core.valueSets.encounterDestination.url)),
        provenance: async(() => getCodeList(getConfig().core.valueSets.encounterProvenance.url)),
        admission: async(() => getCodeList(getConfig().core.valueSets.encounterAdmission.url)),
        encounterStatus: async(() => getCodeList(getConfig().core.valueSets.encounterStatus.url))
      }
    },
    {
      id: CriteriaType.DOCUMENTS,
      title: CriteriaTypeLabels.DOCUMENTS,
      color: ODD_DOCUMENT_REFERENCE ? '#0063AF' : '#808080',
      disabled: !ODD_DOCUMENT_REFERENCE,
      fontWeight: 'bold',
      components: DocumentsForm,
      fetch: {
        docTypes: () => (docTypes && docTypes.docTypes.length > 0 ? docTypes.docTypes : []),
        encounterStatus: async(() => getCodeList(getConfig().core.valueSets.encounterStatus.url))
      }
    },
    {
      id: CriteriaType.PMSI,
      title: CriteriaTypeLabels.PMSI,
      color: '#0063AF',
      fontWeight: 'bold',
      components: null,
      subItems: [
        {
          id: CriteriaType.CONDITION,
          title: CriteriaTypeLabels.CONDITION,
          color: '#0063AF',
          fontWeight: 'normal',
          components: Cim10Form,
          fetch: {
            diagnosticTypes: async(() => getCodeList(getConfig().features.condition.valueSets.conditionStatus.url)),
            cim10Diagnostic: (code: string, system: string) =>
              getCodesForValueSet(code, [system ?? getConfig().features.condition.valueSets.conditionHierarchy.url]),
            encounterStatus: async(() => getCodeList(getConfig().core.valueSets.encounterStatus.url))
          }
        },
        {
          id: CriteriaType.PROCEDURE,
          title: CriteriaTypeLabels.PROCEDURE,
          color: '#0063AF',
          fontWeight: 'normal',
          components: CCAMForm,
          fetch: {
            ccamData: (code: string, system: string) =>
              getCodesForValueSet(code, [system ?? getConfig().features.procedure.valueSets.procedureHierarchy.url]),
            encounterStatus: async(() => getCodeList(getConfig().core.valueSets.encounterStatus.url))
          }
        },
        {
          id: CriteriaType.CLAIM,
          title: CriteriaTypeLabels.CLAIM,
          color: '#0063AF',
          fontWeight: 'normal',
          components: GhmForm,
          fetch: {
            ghmData: (code: string, system: string) =>
              getCodesForValueSet(code, [system ?? getConfig().features.claim.valueSets.claimHierarchy.url]),
            encounterStatus: async(() => getCodeList(getConfig().core.valueSets.encounterStatus.url))
          }
        }
      ]
    },
    {
      id: CriteriaType.MEDICATION,
      title: 'Médicaments (Prescription - Administration)',
      color: ODD_MEDICATION ? '#0063AF' : '#808080',
      fontWeight: 'bold',
      components: MedicationForm,
      disabled: !ODD_MEDICATION,
      fetch: {
        medicationData: (code: string, system: string) => {
          const valueSets = system
            ? [system]
            : [
                getConfig().features.medication.valueSets.medicationAtc.url,
                getConfig().features.medication.valueSets.medicationUcd.url
              ]
          return getCodesForValueSet(code, valueSets)
        },
        prescriptionTypes: async(() =>
          getCodeList(getConfig().features.medication.valueSets.medicationPrescriptionTypes.url)
        ),
        administrations: async(() =>
          getCodeList(getConfig().features.medication.valueSets.medicationAdministrations.url)
        ),
        encounterStatus: async(() => getCodeList(getConfig().core.valueSets.encounterStatus.url))
      }
    },
    {
      id: CriteriaType.BIO_MICRO,
      title: CriteriaTypeLabels.BIO_MICRO,
      color: ODD_BIOLOGY ? '#0063AF' : '#808080',
      fontWeight: 'bold',
      components: null,
      subItems: [
        {
          id: CriteriaType.OBSERVATION,
          title: CriteriaTypeLabels.OBSERVATION,
          color: ODD_BIOLOGY ? '#0063AF' : '#808080',
          fontWeight: 'normal',
          components: BiologyForm,
          disabled: !ODD_BIOLOGY,
          fetch: {
            biologyData: (code: string, system: string) => {
              const valueSets = system
                ? [system]
                : [
                    getConfig().features.observation.valueSets.biologyHierarchyAnabio.url,
                    getConfig().features.observation.valueSets.biologyHierarchyLoinc.url
                  ]
              return getCodesForValueSet(code, valueSets)
            },
            encounterStatus: async(() => getCodeList(getConfig().core.valueSets.encounterStatus.url))
          }
        },
        {
          id: CriteriaType.MICROBIOLOGIE,
          title: CriteriaTypeLabels.MICROBIOLOGIE,
          components: null,
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
      components: null,
      subItems: [
        {
          id: CriteriaType.MATERNITY,
          title: 'Maternité',
          components: null,
          color: '#0063AF',
          fontWeight: 'normal',
          subItems: [
            {
              id: CriteriaType.PREGNANCY,
              title: 'Fiche Grossesse',
              color: ODD_QUESTIONNAIRE ? '#0063AF' : '#808080',
              fontWeight: 'normal',
              disabled: !ODD_QUESTIONNAIRE,
              components: PregnantForm,
              fetch: {
                pregnancyMode: async(() =>
                  getCodeList(getConfig().features.questionnaires.valueSets.pregnancyMode.url)
                ),
                maternalRisks: async(() =>
                  getCodeList(getConfig().features.questionnaires.valueSets.maternalRisks.url)
                ),
                risksRelatedToObstetricHistory: async(() =>
                  getCodeList(getConfig().features.questionnaires.valueSets.risksRelatedToObstetricHistory.url)
                ),
                risksOrComplicationsOfPregnancy: async(() =>
                  getCodeList(getConfig().features.questionnaires.valueSets.risksOrComplicationsOfPregnancy.url)
                ),
                corticotherapie: () => booleanFieldsData,
                prenatalDiagnosis: () => booleanFieldsData,
                ultrasoundMonitoring: () => booleanFieldsData,
                encounterStatus: async(() => getCodeList(getConfig().core.valueSets.encounterStatus.url))
              }
            },
            {
              id: CriteriaType.HOSPIT,
              title: 'Hospitalisation',
              color: ODD_QUESTIONNAIRE ? '#0063AF' : '#808080',
              fontWeight: 'normal',
              disabled: !ODD_QUESTIONNAIRE,
              components: HospitForm,
              fetch: {
                inUteroTransfer: () => booleanOpenChoiceFieldsData,
                pregnancyMonitoring: () => booleanFieldsData,
                maturationCorticotherapie: () => booleanOpenChoiceFieldsData,
                chirurgicalGesture: async(() =>
                  getCodeList(getConfig().features.questionnaires.valueSets.chirurgicalGesture.url)
                ),
                vme: () => vmeData,
                childbirth: () => booleanOpenChoiceFieldsData,
                hospitalChildBirthPlace: () => booleanFieldsData,
                otherHospitalChildBirthPlace: () => booleanFieldsData,
                homeChildBirthPlace: () => booleanFieldsData,
                childbirthMode: async(() =>
                  getCodeList(getConfig().features.questionnaires.valueSets.childBirthMode.url)
                ),
                maturationReason: async(() =>
                  getCodeList(getConfig().features.questionnaires.valueSets.maturationReason.url)
                ),
                maturationModality: async(() =>
                  getCodeList(getConfig().features.questionnaires.valueSets.maturationModality.url)
                ),
                imgIndication: async(() =>
                  getCodeList(getConfig().features.questionnaires.valueSets.imgIndication.url)
                ),
                laborOrCesareanEntry: async(() =>
                  getCodeList(getConfig().features.questionnaires.valueSets.laborOrCesareanEntry.url)
                ),
                pathologyDuringLabor: async(() =>
                  getCodeList(getConfig().features.questionnaires.valueSets.pathologyDuringLabor.url)
                ),
                obstetricalGestureDuringLabor: async(() =>
                  getCodeList(getConfig().features.questionnaires.valueSets.obstetricalGestureDuringLabor.url)
                ),
                analgesieType: async(() =>
                  getCodeList(getConfig().features.questionnaires.valueSets.analgesieType.url)
                ),
                birthDeliveryWay: async(() =>
                  getCodeList(getConfig().features.questionnaires.valueSets.birthDeliveryWay.url)
                ),
                instrumentType: async(() =>
                  getCodeList(getConfig().features.questionnaires.valueSets.instrumentType.url)
                ),
                cSectionModality: async(() =>
                  getCodeList(getConfig().features.questionnaires.valueSets.cSectionModality.url)
                ),
                presentationAtDelivery: async(() =>
                  getCodeList(getConfig().features.questionnaires.valueSets.presentationAtDelivery.url)
                ),
                birthStatus: () => birthStatusData,
                postpartumHemorrhage: () => booleanOpenChoiceFieldsData,
                conditionPerineum: async(() =>
                  getCodeList(getConfig().features.questionnaires.valueSets.conditionPerineum.url)
                ),
                exitPlaceType: async(() =>
                  getCodeList(getConfig().features.questionnaires.valueSets.exitPlaceType.url)
                ),
                feedingType: async(() => getCodeList(getConfig().features.questionnaires.valueSets.feedingType.url)),
                complication: () => booleanFieldsData,
                exitFeedingMode: async(() =>
                  getCodeList(getConfig().features.questionnaires.valueSets.exitFeedingMode.url)
                ),
                exitDiagnostic: async(() =>
                  getCodeList(getConfig().features.questionnaires.valueSets.exitDiagnostic.url)
                ),
                encounterStatus: async(() => getCodeList(getConfig().core.valueSets.encounterStatus.url))
              }
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
      components: ImagingForm,
      disabled: !ODD_IMAGING,
      fetch: {
        modalities: async(() => getCodeList(getConfig().features.imaging.valueSets.imagingModalities.url, true)),
        encounterStatus: async(() => getCodeList(getConfig().core.valueSets.encounterStatus.url))
      }
    },
    {
      id: CriteriaType.PHYSIOLOGIE,
      title: CriteriaTypeLabels.PHYSIOLOGIE,
      color: '#808080',
      fontWeight: 'bold',
      disabled: true,
      components: null
    }
  ]
}

export default criteriaList
