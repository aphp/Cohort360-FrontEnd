import { ScopeElement, SimpleCodeType } from 'types'
import { Hierarchy } from './hierarchy'
import { DocumentAttachmentMethod, DurationRangeType, LabelObject, SearchByTypes } from './searchCriterias'

export enum QuestionnaireResponseParamsKeys {
  NAME = 'questionnaire.name',
  DATE = 'authored',
  EXECUTIVE_UNITS = 'encounter.encounter-care-site',
  ENCOUNTER_STATUS = 'encounter.status',
  IPP = 'subject.identifier'
}

export enum IppParamsKeys {
  IPP_LIST_FHIR = 'identifier.value'
}

export enum MedicationLabel {
  PRESCRIPTION = 'Prescription',
  ADMINISTRATION = 'Administration'
}

export enum ResourceType {
  UNKNOWN = 'Unknown',
  IPP_LIST = 'IPPList',
  PATIENT = 'Patient',
  ENCOUNTER = 'Encounter',
  DOCUMENTS = 'DocumentReference',
  CONDITION = 'Condition',
  PROCEDURE = 'Procedure',
  CLAIM = 'Claim',
  MEDICATION_REQUEST = 'MedicationRequest',
  MEDICATION_ADMINISTRATION = 'MedicationAdministration',
  OBSERVATION = 'Observation',
  IMAGING = 'ImagingStudy',
  QUESTIONNAIRE = 'Questionnaire',
  QUESTIONNAIRE_RESPONSE = 'QuestionnaireResponse'
}

export type PMSIResourceTypes = ResourceType.CONDITION | ResourceType.PROCEDURE | ResourceType.CLAIM

export enum PatientsParamsKeys {
  GENDERS = 'gender',
  DATE_DEIDENTIFIED = 'age-month',
  DATE_IDENTIFIED = 'age-day',
  VITAL_STATUS = 'deceased',
  BIRTHDATE = 'birthdate',
  DEATHDATE = 'death-date'
}

export enum EncounterParamsKeys {
  DURATION = 'length',
  MIN_BIRTHDATE_DAY = 'start-age-visit',
  MIN_BIRTHDATE_MONTH = 'start-age-visit-month',
  ENTRYMODE = 'admission-mode',
  EXITMODE = 'discharge-disposition-mode',
  PRISENCHARGETYPE = 'class',
  TYPEDESEJOUR = 'stay',
  ADMISSIONMODE = 'reason-code',
  REASON = 'admission-destination-type',
  DESTINATION = 'discharge-disposition',
  PROVENANCE = 'admit-source',
  ADMISSION = 'admission-type',
  SERVICE_PROVIDER = 'encounter-care-site',
  STATUS = 'status',
  START_DATE = 'period-start',
  END_DATE = 'period-end'
}

export enum DocumentsParamsKeys {
  IPP = 'subject.identifier',
  DOC_STATUSES = 'docstatus',
  DOC_TYPES = 'type',
  ONLY_PDF_AVAILABLE = 'onlyPdfAvailable',
  NDA = 'encounter.identifier',
  DATE = 'date',
  EXECUTIVE_UNITS = 'encounter.encounter-care-site',
  ENCOUNTER_STATUS = 'encounter.status'
}

export enum ConditionParamsKeys {
  NDA = 'encounter.identifier',
  CODE = 'code',
  DIAGNOSTIC_TYPES = 'orbis-status',
  DATE = 'recorded-date',
  EXECUTIVE_UNITS = 'encounter.encounter-care-site',
  SOURCE = '_source',
  ENCOUNTER_STATUS = 'encounter.status',
  IPP = 'subject.identifier'
}

export enum ProcedureParamsKeys {
  NDA = 'encounter.identifier',
  CODE = 'code',
  SOURCE = '_source',
  DATE = 'date',
  EXECUTIVE_UNITS = 'encounter.encounter-care-site',
  ENCOUNTER_STATUS = 'encounter.status',
  IPP = 'subject.identifier'
}

export enum ClaimParamsKeys {
  NDA = 'encounter.identifier',
  CODE = 'diagnosis',
  DATE = 'created',
  EXECUTIVE_UNITS = 'encounter.encounter-care-site',
  ENCOUNTER_STATUS = 'encounter.status',
  IPP = 'patient.identifier'
}

export enum PrescriptionParamsKeys {
  NDA = 'encounter.identifier',
  PRESCRIPTION_TYPES = 'category',
  DATE = 'validity-period-start',
  END_DATE = 'validity-period-end',
  CODE = 'code',
  EXECUTIVE_UNITS = 'encounter.encounter-care-site',
  ENCOUNTER_STATUS = 'encounter.status',
  PRESCRIPTION_ROUTES = 'dosage-instruction-route'
}

export enum AdministrationParamsKeys {
  NDA = 'context.identifier',
  ADMINISTRATION_ROUTES = 'dosage-route',
  DATE = 'effective-time',
  EXECUTIVE_UNITS = 'context.encounter-care-site',
  ENCOUNTER_STATUS = 'context.status'
}

export enum ObservationParamsKeys {
  NDA = 'encounter.identifier',
  ANABIO_LOINC = 'code',
  VALIDATED_STATUS = 'status',
  DATE = 'date',
  VALUE = 'value-quantity',
  EXECUTIVE_UNITS = 'encounter.encounter-care-site',
  ENCOUNTER_STATUS = 'encounter.status',
  IPP = 'subject.identifier'
}

export enum ImagingParamsKeys {
  IPP = 'patient.identifier',
  MODALITY = 'modality',
  NDA = 'encounter.identifier',
  DATE = 'started',
  STUDY_DESCRIPTION = 'description',
  STUDY_PROCEDURE = 'procedureCode',
  NB_OF_SERIES = 'numberOfSeries',
  NB_OF_INS = 'numberOfInstances',
  WITH_DOCUMENT = 'with-document',
  STUDY_UID = 'identifier',
  SERIES_DATE = 'series-started',
  SERIES_DESCRIPTION = 'series-description',
  SERIES_PROTOCOL = 'series-protocol',
  SERIES_MODALITIES = 'series-modality',
  SERIES_UID = 'series',
  EXECUTIVE_UNITS = 'encounter.encounter-care-site',
  ENCOUNTER_STATUS = 'encounter.status'
}

export enum CriteriaType {
  REQUEST = 'Request',
  IPP_LIST = 'IPPList',
  PATIENT = 'Patient',
  ENCOUNTER = 'Encounter',
  DOCUMENTS = 'DocumentReference',
  PMSI = 'pmsi',
  CONDITION = 'Condition',
  PROCEDURE = 'Procedure',
  CLAIM = 'Claim',
  MEDICATION = 'Medication',
  MEDICATION_REQUEST = 'MedicationRequest',
  MEDICATION_ADMINISTRATION = 'MedicationAdministration',
  BIO_MICRO = 'biologie_microbiologie',
  OBSERVATION = 'Observation',
  MICROBIOLOGIE = 'microbiologie',
  PHYSIOLOGIE = 'physiologie',
  IMAGING = 'ImagingStudy',
  SPECIALITY = 'Speciality',
  QUESTIONNAIRE = 'Questionnaire',
  QUESTIONNAIRE_RESPONSE = 'QuestionnaireResponse',
  MATERNITY = 'Maternity',
  PREGNANCY = 'Pregnancy',
  HOSPIT = 'Hospit'
}

export type CriteriaTypesWithAdvancedInputs = Extract<
  CriteriaType,
  | CriteriaType.DOCUMENTS
  | CriteriaType.CONDITION
  | CriteriaType.PROCEDURE
  | CriteriaType.CLAIM
  | CriteriaType.MEDICATION_REQUEST
  | CriteriaType.MEDICATION_ADMINISTRATION
  | CriteriaType.OBSERVATION
  | CriteriaType.IMAGING
>

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

export type CommonCriteriaDataType = {
  id: number
  error?: boolean
  type: CriteriaType
  encounterService?: Hierarchy<ScopeElement, string>[]
  isInclusive?: boolean
  title: string
}

export type WithOccurenceCriteriaDataType = {
  occurrence?: number | null
  occurrenceComparator?: Comparators | null
  startOccurrence: DurationRangeType
  endOccurrence?: DurationRangeType
}

export type WithEncounterDateDataType = {
  encounterStartDate: DurationRangeType
  includeEncounterStartDateNull?: boolean
  encounterEndDate: DurationRangeType
  includeEncounterEndDateNull?: boolean
}

export type WithEncounterStatusDataType = {
  encounterStatus: LabelObject[]
}

export type SelectedCriteriaType =
  | CcamDataType
  | Cim10DataType
  | DemographicDataType
  | GhmDataType
  | EncounterDataType
  | DocumentDataType
  | MedicationDataType
  | ObservationDataType
  | IPPListDataType
  | ImagingDataType
  | PregnancyDataType
  | HospitDataType

export type SelectedCriteriaTypesWithAdvancedInputs = Exclude<
  SelectedCriteriaType,
  DemographicDataType | IPPListDataType | PregnancyDataType | HospitDataType | EncounterDataType
>

export type SelectedCriteriaTypesWithOccurrences = Exclude<SelectedCriteriaType, DemographicDataType | IPPListDataType>

export enum CriteriaDataKey {
  GENDER = 'gender',
  VITALSTATUS = 'status',
  PRISE_EN_CHARGE_TYPE = 'priseEnChargeType',
  TYPE_DE_SEJOUR = 'typeDeSejour',
  FILE_STATUS = 'fileStatus',
  ADMISSION_MODE = 'admissionModes',
  ADMISSION = 'admission',
  ENTRY_MODES = 'entryModes',
  EXIT_MODES = 'exitModes',
  REASON = 'reason',
  DESTINATION = 'destination',
  PROVENANCE = 'provenance',
  CIM_10_DIAGNOSTIC = 'cim10Diagnostic',
  DIAGNOSTIC_TYPES = 'diagnosticTypes',
  CCAM_DATA = 'ccamData',
  GHM_DATA = 'ghmData',
  MEDICATION_DATA = 'medicationData',
  PRESCRIPTION_TYPES = 'prescriptionTypes',
  ADMINISTRATIONS = 'administrations',
  BIOLOGY_DATA = 'biologyData',
  MODALITIES = 'modalities',
  DOC_TYPES = 'docTypes',
  STATUS_DIAGNOSTIC = 'statusDiagnostic',
  PREGNANCY_MODE = 'pregnancyMode',
  MATERNAL_RISKS = 'maternalRisks',
  RISKS_RELATED_TO_OBSTETRIC_HISTORY = 'risksRelatedToObstetricHistory',
  RISKS_OR_COMPLICATIONS_OF_PREGNANCY = 'risksOrComplicationsOfPregnancy',
  CORTICOTHERAPIE = 'corticotherapie',
  PRENATAL_DIAGNOSIS = 'prenatalDiagnosis',
  ULTRASOUND_MONITORING = 'ultrasoundMonitoring',
  IN_UTERO_TRANSFER = 'inUteroTransfer',
  PREGNANCY_MONITORING = 'pregnancyMonitoring',
  MATURATION_CORTICOTHERAPIE = 'maturationCorticotherapie',
  CHIRURGICAL_GESTURE = 'chirurgicalGesture',
  VME = 'vme',
  CHILDBIRTH = 'childbirth',
  HOSPITALCHILDBIRTHPLACE = 'hospitalChildBirthPlace',
  OTHERHOSPITALCHILDBIRTHPLACE = 'otherHospitalChildBirthPlace',
  HOMECHILDBIRTHPLACE = 'homeChildBirthPlace',
  CHILDBIRTH_MODE = 'childbirthMode',
  MATURATION_REASON = 'maturationReason',
  MATURATION_MODALITY = 'maturationModality',
  IMG_INDICATION = 'imgIndication',
  LABOR_OR_CESAREAN_ENTRY = 'laborOrCesareanEntry',
  PATHOLOGY_DURING_LABOR = 'pathologyDuringLabor',
  OBSTETRICAL_GESTURE_DURING_LABOR = 'obstetricalGestureDuringLabor',
  ANALGESIE_TYPE = 'analgesieType',
  BIRTH_DELIVERY_WAY = 'birthDeliveryWay',
  INSTRUMENT_TYPE = 'instrumentType',
  C_SECTION_MODALITY = 'cSectionModality',
  PRESENTATION_AT_DELIVERY = 'presentationAtDelivery',
  BIRTHSTATUS = 'birthStatus',
  POSTPARTUM_HEMORRHAGE = 'postpartumHemorrhage',
  CONDITION_PERINEUM = 'conditionPerineum',
  EXIT_PLACE_TYPE = 'exitPlaceType',
  FEEDING_TYPE = 'feedingType',
  COMPLICATION = 'complication',
  EXIT_FEEDING_MODE = 'exitFeedingMode',
  EXIT_DIAGNOSTIC = 'exitDiagnostic',
  DOC_STATUSES = 'docStatuses',
  ENCOUNTER_STATUS = 'encounterStatus'
}

export type CcamDataType = CommonCriteriaDataType &
  WithOccurenceCriteriaDataType &
  WithEncounterDateDataType &
  WithEncounterStatusDataType & {
    type: CriteriaType.PROCEDURE
    hierarchy: undefined
    code: LabelObject[] | null
    source: string | null
    label: undefined
  }

export type Cim10DataType = CommonCriteriaDataType &
  WithOccurenceCriteriaDataType &
  WithEncounterDateDataType &
  WithEncounterStatusDataType & {
    type: CriteriaType.CONDITION
    code: LabelObject[] | null
    source: string | null
    diagnosticType: LabelObject[] | null
    label: undefined
  }

export type DemographicDataType = CommonCriteriaDataType & {
  type: CriteriaType.PATIENT
  genders: LabelObject[] | null
  vitalStatus: LabelObject[] | null
  age: DurationRangeType
  birthdates: DurationRangeType
  deathDates: DurationRangeType
}

export type IPPListDataType = CommonCriteriaDataType & {
  type: CriteriaType.IPP_LIST
  search: string
}

export type DocumentDataType = CommonCriteriaDataType &
  WithOccurenceCriteriaDataType &
  WithEncounterDateDataType &
  WithEncounterStatusDataType & {
    type: CriteriaType.DOCUMENTS
    search: string
    searchBy: SearchByTypes.TEXT | SearchByTypes.DESCRIPTION
    docType: SimpleCodeType[] | null
    docStatuses: string[]
  }

export type GhmDataType = CommonCriteriaDataType &
  WithOccurenceCriteriaDataType &
  WithEncounterDateDataType &
  WithEncounterStatusDataType & {
    type: CriteriaType.CLAIM
    code: LabelObject[] | null
    label: undefined
  }

export enum Comparators {
  LESS_OR_EQUAL = '<=',
  LESS = '<',
  EQUAL = '=',
  GREATER = '>',
  GREATER_OR_EQUAL = '>=',
  BETWEEN = '≤x≥'
}

export type EncounterDataType = CommonCriteriaDataType &
  WithOccurenceCriteriaDataType &
  WithEncounterDateDataType &
  WithEncounterStatusDataType & {
    type: CriteriaType.ENCOUNTER
    age: DurationRangeType
    duration: DurationRangeType
    admissionMode: LabelObject[] | null
    entryMode: LabelObject[] | null
    exitMode: LabelObject[] | null
    priseEnChargeType: LabelObject[] | null
    typeDeSejour: LabelObject[] | null
    reason: LabelObject[] | null
    destination: LabelObject[] | null
    provenance: LabelObject[] | null
    admission: LabelObject[] | null
  }

export type PregnancyDataType = CommonCriteriaDataType &
  WithOccurenceCriteriaDataType &
  WithEncounterStatusDataType & {
    type: CriteriaType.PREGNANCY
    pregnancyStartDate: string | null | undefined
    pregnancyEndDate: string | null | undefined
    pregnancyMode: LabelObject[] | null
    foetus: number
    foetusComparator: Comparators
    parity: number
    parityComparator: Comparators
    maternalRisks: LabelObject[] | null
    maternalRisksPrecision: string
    risksRelatedToObstetricHistory: LabelObject[] | null
    risksRelatedToObstetricHistoryPrecision: string
    risksOrComplicationsOfPregnancy: LabelObject[] | null
    risksOrComplicationsOfPregnancyPrecision: string
    corticotherapie: LabelObject[] | null
    prenatalDiagnosis: LabelObject[] | null
    ultrasoundMonitoring: LabelObject[] | null
  }

export type HospitDataType = CommonCriteriaDataType &
  WithOccurenceCriteriaDataType &
  WithEncounterStatusDataType & {
    type: CriteriaType.HOSPIT
    hospitReason: string
    inUteroTransfer: LabelObject[] | null
    pregnancyMonitoring: LabelObject[] | null
    vme: LabelObject[] | null
    maturationCorticotherapie: LabelObject[] | null
    chirurgicalGesture: LabelObject[] | null
    childbirth: LabelObject[] | null
    hospitalChildBirthPlace: LabelObject[] | null
    otherHospitalChildBirthPlace: LabelObject[] | null
    homeChildBirthPlace: LabelObject[] | null
    childbirthMode: LabelObject[] | null
    maturationReason: LabelObject[] | null
    maturationModality: LabelObject[] | null
    imgIndication: LabelObject[] | null
    laborOrCesareanEntry: LabelObject[] | null
    pathologyDuringLabor: LabelObject[] | null
    obstetricalGestureDuringLabor: LabelObject[] | null
    analgesieType: LabelObject[] | null
    birthDeliveryStartDate: string | null | undefined
    birthDeliveryEndDate: string | null | undefined
    birthDeliveryWeeks: number
    birthDeliveryWeeksComparator: Comparators
    birthDeliveryDays: number
    birthDeliveryDaysComparator: Comparators
    birthDeliveryWay: LabelObject[] | null
    instrumentType: LabelObject[] | null
    cSectionModality: LabelObject[] | null
    presentationAtDelivery: LabelObject[] | null
    birthMensurationsGrams: number
    birthMensurationsGramsComparator: Comparators
    birthMensurationsPercentil: number
    birthMensurationsPercentilComparator: Comparators
    apgar1: number
    apgar1Comparator: Comparators
    apgar3: number
    apgar3Comparator: Comparators
    apgar5: number
    apgar5Comparator: Comparators
    apgar10: number
    apgar10Comparator: Comparators
    arterialPhCord: number
    arterialPhCordComparator: Comparators
    arterialCordLactates: number
    arterialCordLactatesComparator: Comparators
    birthStatus: LabelObject[] | null
    postpartumHemorrhage: LabelObject[] | null
    conditionPerineum: LabelObject[] | null
    exitPlaceType: LabelObject[] | null
    feedingType: LabelObject[] | null
    complication: LabelObject[] | null
    exitFeedingMode: LabelObject[] | null
    exitDiagnostic: LabelObject[] | null
  }

export type MedicationDataType = CommonCriteriaDataType &
  WithOccurenceCriteriaDataType &
  WithEncounterDateDataType &
  WithEncounterStatusDataType & {
    code: LabelObject[] | null
    administration: LabelObject[] | null
  } & (
    | {
        type: CriteriaType.MEDICATION_REQUEST
        prescriptionType: LabelObject[] | null
      }
    | { type: CriteriaType.MEDICATION_ADMINISTRATION }
  )

export type ObservationDataType = CommonCriteriaDataType &
  WithOccurenceCriteriaDataType &
  WithEncounterDateDataType &
  WithEncounterStatusDataType & {
    type: CriteriaType.OBSERVATION
    code: LabelObject[] | null
    isLeaf: boolean
    searchByValue: [number | null, number | null]
    valueComparator: Comparators
  }

export type ImagingDataType = CommonCriteriaDataType &
  WithOccurenceCriteriaDataType &
  WithEncounterDateDataType &
  WithEncounterStatusDataType & {
    type: CriteriaType.IMAGING
    studyStartDate: string | null
    studyEndDate: string | null
    studyModalities: LabelObject[] | null
    studyDescription: string
    studyProcedure: string
    numberOfSeries: number
    seriesComparator: Comparators
    numberOfIns: number
    instancesComparator: Comparators
    withDocument: DocumentAttachmentMethod
    daysOfDelay: string | null
    studyUid: string
    seriesStartDate: string | null
    seriesEndDate: string | null
    seriesDescription: string
    seriesProtocol: string
    seriesModalities: LabelObject[] | null
    seriesUid: string
  }

export enum VitalStatusLabel {
  ALIVE = 'Vivant(e)',
  DECEASED = 'Décédé(e)',
  ALL = 'Tous les patients'
}
