export let BOOLEANTRUE = 'true'

export const ACCESS_TOKEN = 'access_token'
export const REFRESH_TOKEN = 'refresh_token'

export const OIDC_PROVIDER_URL = import.meta.env.DEV
  ? import.meta.env.VITE_OIDC_PROVIDER_URL
  : '{VITE_OIDC_PROVIDER_URL}'
export const OIDC_REDIRECT_URI = import.meta.env.DEV
  ? import.meta.env.VITE_OIDC_REDIRECT_URI
  : '{VITE_OIDC_REDIRECT_URI}'
export const OIDC_RESPONSE_TYPE = import.meta.env.DEV
  ? import.meta.env.VITE_OIDC_RESPONSE_TYPE
  : '{VITE_OIDC_RESPONSE_TYPE}'
export const OIDC_CLIENT_ID = import.meta.env.DEV ? import.meta.env.VITE_OIDC_CLIENT_ID : '{VITE_OIDC_CLIENT_ID}'
export const OIDC_SCOPE = import.meta.env.DEV ? import.meta.env.VITE_OIDC_SCOPE : '{VITE_OIDC_SCOPE}'
export const OIDC_STATE = import.meta.env.DEV ? import.meta.env.VITE_OIDC_STATE : '{VITE_OIDC_STATE}'

export const BACK_API_URL = import.meta.env.DEV ? import.meta.env.VITE_BACK_API_URL : '{VITE_BACK_API_URL}'
export const REQUEST_API_URL = import.meta.env.DEV ? import.meta.env.VITE_REQUEST_API_URL : '{VITE_REQUEST_API_URL}'
export const FHIR_API_URL = import.meta.env.DEV ? import.meta.env.VITE_FHIR_API_URL : '{VITE_FHIR_API_URL}'
export const AUTH_API_URL = import.meta.env.DEV ? import.meta.env.VITE_AUTH_API_URL : '{VITE_AUTH_API_URL}'

export const SHORT_COHORT_LIMIT = 20000

export const CODE_HIERARCHY_EXTENSION_NAME =
  'https://terminology.eds.aphp.fr/fhir/profile/valueSet/extension/hierarchy-path-id'
export const CONCEPT_MAP_HIERARCHY_EXTENSION_NAME =
  'https://terminology.eds.aphp.fr/fhir/profile/conceptMap/extension/group-source-hierarchy-path'

export const DOC_STATUS_CODE_SYSTEM = 'http://hl7.org/fhir/CodeSystem/composition-status'

export const CLAIM_HIERARCHY = import.meta.env.DEV
  ? import.meta.env.VITE_VALUE_SET_URL_CLAIM_HIERARCHY
  : '{VITE_VALUE_SET_URL_CLAIM_HIERARCHY}'
export const CONDITION_HIERARCHY = import.meta.env.DEV
  ? import.meta.env.VITE_VALUE_SET_URL_CONDITION_HIERARCHY
  : '{VITE_VALUE_SET_URL_CONDITION_HIERARCHY}'
export const CONDITION_STATUS = import.meta.env.DEV
  ? import.meta.env.VITE_VALUE_SET_URL_CONDITION_STATUS
  : '{VITE_VALUE_SET_URL_CONDITION_STATUS}'

export const PROCEDURE_HIERARCHY = import.meta.env.DEV
  ? import.meta.env.VITE_VALUE_SET_URL_PROCEDURE_HIERARCHY
  : '{VITE_VALUE_SET_URL_PROCEDURE_HIERARCHY}'

export const DEMOGRAPHIC_GENDER = import.meta.env.DEV
  ? import.meta.env.VITE_VALUE_SET_URL_DEMOGRAPHIC_GENDER
  : '{VITE_VALUE_SET_URL_DEMOGRAPHIC_GENDER}'

export const ENCOUNTER_ADMISSION_MODE = import.meta.env.DEV
  ? import.meta.env.VITE_VALUE_SET_URL_ENCOUNTER_ADMISSION_MODE
  : '{VITE_VALUE_SET_URL_ENCOUNTER_ADMISSION_MODE}'

export const ENCOUNTER_ENTRY_MODE = import.meta.env.DEV
  ? import.meta.env.VITE_VALUE_SET_URL_ENCOUNTER_ENTRY_MODE
  : '{VITE_VALUE_SET_URL_ENCOUNTER_ENTRY_MODE}'

export const ENCOUNTER_EXIT_MODE = import.meta.env.DEV
  ? import.meta.env.VITE_VALUE_SET_URL_ENCOUNTER_EXIT_MODE
  : '{VITE_VALUE_SET_URL_ENCOUNTER_EXIT_MODE}'

export const ENCOUNTER_VISIT_TYPE = import.meta.env.DEV
  ? import.meta.env.VITE_VALUE_SET_URL_ENCOUNTER_VISIT_TYPE
  : '{VITE_VALUE_SET_URL_ENCOUNTER_VISIT_TYPE}'

export const ENCOUNTER_SEJOUR_TYPE = import.meta.env.DEV
  ? import.meta.env.VITE_VALUE_SET_URL_ENCOUNTER_SEJOUR_TYPE
  : '{VITE_VALUE_SET_URL_ENCOUNTER_SEJOUR_TYPE}'

export const ENCOUNTER_FILE_STATUS = import.meta.env.DEV
  ? import.meta.env.VITE_VALUE_SET_URL_ENCOUNTER_FILE_STATUS
  : '{VITE_VALUE_SET_URL_ENCOUNTER_FILE_STATUS}'
export const ENCOUNTER_EXIT_TYPE = import.meta.env.DEV
  ? import.meta.env.VITE_VALUE_SET_URL_ENCOUNTER_EXIT_TYPE
  : '{VITE_VALUE_SET_URL_ENCOUNTER_EXIT_TYPE}'
export const ENCOUNTER_DESTINATION = import.meta.env.DEV
  ? import.meta.env.VITE_VALUE_SET_URL_ENCOUNTER_DESTINATION
  : '{VITE_VALUE_SET_URL_ENCOUNTER_DESTINATION}'

export const ENCOUNTER_PROVENANCE = import.meta.env.DEV
  ? import.meta.env.VITE_VALUE_SET_URL_ENCOUNTER_PROVENANCE
  : '{VITE_VALUE_SET_URL_ENCOUNTER_PROVENANCE}'

export const ENCOUNTER_ADMISSION = import.meta.env.DEV
  ? import.meta.env.VITE_VALUE_SET_URL_ENCOUNTER_ADMISSION
  : '{VITE_VALUE_SET_URL_ENCOUNTER_ADMISSION}'

export const MEDICATION_ATC_ORBIS = import.meta.env.DEV
  ? import.meta.env.VITE_MEDICATION_ATC_ORBIS
  : '{VITE_MEDICATION_ATC_ORBIS}'

export const MEDICATION_ATC = import.meta.env.DEV
  ? import.meta.env.VITE_VALUE_SET_URL_MEDICATION_ATC
  : '{VITE_VALUE_SET_URL_MEDICATION_ATC}'

export const MEDICATION_UCD = import.meta.env.DEV
  ? import.meta.env.VITE_VALUE_SET_URL_MEDICATION_UCD
  : '{VITE_VALUE_SET_URL_MEDICATION_UCD}'

export const MEDICATION_PRESCRIPTION_TYPES = import.meta.env.DEV
  ? import.meta.env.VITE_VALUE_SET_URL_MEDICATION_PRESCRIPTION_TYPES
  : '{VITE_VALUE_SET_URL_MEDICATION_PRESCRIPTION_TYPES}'

export const MEDICATION_ADMINISTRATIONS = import.meta.env.DEV
  ? import.meta.env.VITE_VALUE_SET_URL_MEDICATION_ADMINISTRATIONS
  : '{VITE_VALUE_SET_URL_MEDICATION_ADMINISTRATIONS}'

export const BIOLOGY_HIERARCHY_ITM_ANABIO = import.meta.env.DEV
  ? import.meta.env.VITE_VALUE_SET_URL_BIOLOGY_ANABIO
  : '{VITE_VALUE_SET_URL_BIOLOGY_ANABIO}'
export const BIOLOGY_HIERARCHY_ITM_LOINC = import.meta.env.DEV
  ? import.meta.env.VITE_VALUE_SET_URL_BIOLOGY_LOINC
  : '{VITE_VALUE_SET_URL_BIOLOGY_LOINC}'
export const IMAGING_MODALITIES = import.meta.env.DEV
  ? import.meta.env.VITE_VALUE_SET_URL_IMAGING_MODALITIES
  : '{VITE_VALUE_SET_URL_IMAGING_MODALITIES}'
export const IMAGING_STUDY_UID_URL = import.meta.env.DEV
  ? import.meta.env.VITE_VALUE_SET_URL_IMAGING_STUDY_UID
  : '{VITE_VALUE_SET_URL_IMAGING_STUDY_UID}'
export const PREGNANCY_MODE = import.meta.env.DEV
  ? import.meta.env.VITE_VALUE_SET_URL_PREGNANCY_MODE
  : '{VITE_VALUE_SET_URL_PREGNANCY_MODE}'
export const MATERNAL_RISKS = import.meta.env.DEV
  ? import.meta.env.VITE_VALUE_SET_URL_MATERNAL_RISKS
  : '{VITE_VALUE_SET_URL_MATERNAL_RISKS}'
export const RISKSRELATEDTOOBSTETRICHISTORY = import.meta.env.DEV
  ? import.meta.env.VITE_VALUE_SET_URL_RISKSRELATEDTOOBSTETRICHISTORY
  : '{VITE_VALUE_SET_URL_RISKSRELATEDTOOBSTETRICHISTORY}'
export const RISKSORCOMPLICATIONSOFPREGNANCY = import.meta.env.DEV
  ? import.meta.env.VITE_VALUE_SET_URL_RISKSORCOMPLICATIONSOFPREGNANCY
  : '{VITE_VALUE_SET_URL_RISKSORCOMPLICATIONSOFPREGNANCY}'

export const CHIRURGICAL_GESTURE = import.meta.env.DEV
  ? import.meta.env.VITE_VALUE_SET_URL_CHIRURGICAL_GESTURE
  : '{VITE_VALUE_SET_URL_CHIRURGICAL_GESTURE}'
export const CHILD_BIRTH_MODE = import.meta.env.DEV
  ? import.meta.env.VITE_VALUE_SET_URL_CHILD_BIRTH_MODE
  : '{VITE_VALUE_SET_URL_CHILD_BIRTH_MODE}'
export const MATURATION_REASON = import.meta.env.DEV
  ? import.meta.env.VITE_VALUE_SET_URL_MATURATION_REASON
  : '{VITE_VALUE_SET_URL_MATURATION_REASON}'
export const MATURATION_MODALITY = import.meta.env.DEV
  ? import.meta.env.VITE_VALUE_SET_URL_MATURATION_MODALITY
  : '{VITE_VALUE_SET_URL_MATURATION_MODALITY}'
export const IMG_INDICATION = import.meta.env.DEV
  ? import.meta.env.VITE_VALUE_SET_URL_IMG_INDICATION
  : '{VITE_VALUE_SET_URL_IMG_INDICATION}'
export const LABOR_OR_CESAREAN_ENTRY = import.meta.env.DEV
  ? import.meta.env.VITE_VALUE_SET_URL_LABOR_OR_CESAREAN_ENTRY
  : '{VITE_VALUE_SET_URL_LABOR_OR_CESAREAN_ENTRY}'
export const PATHOLOGY_DURING_LABOR = import.meta.env.DEV
  ? import.meta.env.VITE_VALUE_SET_URL_PATHOLOGY_DURING_LABOR
  : '{VITE_VALUE_SET_URL_PATHOLOGY_DURING_LABOR}'
export const OBSTETRICAL_GESTURE_DURING_LABOR = import.meta.env.DEV
  ? import.meta.env.VITE_VALUE_SET_URL_OBSTETRICAL_GESTURE_DURING_LABOR
  : '{VITE_VALUE_SET_URL_OBSTETRICAL_GESTURE_DURING_LABOR}'
export const ANALGESIE_TYPE = import.meta.env.DEV
  ? import.meta.env.VITE_VALUE_SET_URL_ANALGESIE_TYPE
  : '{VITE_VALUE_SET_URL_ANALGESIE_TYPE}'
export const BIRTH_DELIVERY_WAY = import.meta.env.DEV
  ? import.meta.env.VITE_VALUE_SET_URL_BIRTH_DELIVERY_WAY
  : '{VITE_VALUE_SET_URL_BIRTH_DELIVERY_WAY}'
export const INSTRUMENT_TYPE = import.meta.env.DEV
  ? import.meta.env.VITE_VALUE_SET_URL_INSTRUMENT_TYPE
  : '{VITE_VALUE_SET_URL_INSTRUMENT_TYPE}'
export const C_SECTION_MODALITY = import.meta.env.DEV
  ? import.meta.env.VITE_VALUE_SET_URL_C_SECTION_MODALITY
  : '{VITE_VALUE_SET_URL_C_SECTION_MODALITY}'
export const PRESENTATION_AT_DELIVERY = import.meta.env.DEV
  ? import.meta.env.VITE_VALUE_SET_URL_PRESENTATION_AT_DELIVERY
  : '{VITE_VALUE_SET_URL_PRESENTATION_AT_DELIVERY}'
export const CONDITION_PERINEUM = import.meta.env.DEV
  ? import.meta.env.VITE_VALUE_SET_URL_CONDITION_PERINEUM
  : '{VITE_VALUE_SET_URL_CONDITION_PERINEUM}'
export const EXIT_PLACE_TYPE = import.meta.env.DEV
  ? import.meta.env.VITE_VALUE_SET_URL_EXIT_PLACE_TYPE
  : '{VITE_VALUE_SET_URL_EXIT_PLACE_TYPE}'
export const FEEDING_TYPE = import.meta.env.DEV
  ? import.meta.env.VITE_VALUE_SET_URL_FEEDING_TYPE
  : '{VITE_VALUE_SET_URL_FEEDING_TYPE}'
export const EXIT_FEEDING_MODE = import.meta.env.DEV
  ? import.meta.env.VITE_VALUE_SET_URL_EXIT_FEEDING_MODE
  : '{VITE_VALUE_SET_URL_EXIT_FEEDING_MODE}'
export const EXIT_DIAGNOSTIC = import.meta.env.DEV
  ? import.meta.env.VITE_VALUE_SET_URL_EXIT_DIAGNOSTIC
  : '{VITE_VALUE_SET_URL_EXIT_DIAGNOSTIC}'
export const ENCOUNTER_STATUS = import.meta.env.DEV
  ? import.meta.env.VITE_VALUE_SET_URL_ENCOUNTER_STATUS
  : '{VITE_VALUE_SET_URL_ENCOUNTER_STATUS}'

export const MAIL_SUPPORT = import.meta.env.DEV ? import.meta.env.VITE_MAIL_SUPPORT : '{VITE_MAIL_SUPPORT}'

export const CODE_DISPLAY_JWT = import.meta.env.DEV ? import.meta.env.VITE_CODE_DISPLAY_JWT : '{VITE_CODE_DISPLAY_JWT}'

export const ODD_BIOLOGY = import.meta.env.DEV
  ? import.meta.env.VITE_ODD_BIOLOGY == `${BOOLEANTRUE}`
  : '{VITE_ODD_BIOLOGY}' == `${BOOLEANTRUE}`

export const ODD_IMAGING = import.meta.env.DEV
  ? import.meta.env.VITE_ODD_IMAGING == `${BOOLEANTRUE}`
  : '{VITE_ODD_IMAGING}' == `${BOOLEANTRUE}`

export const ODD_COMPOSITION = import.meta.env.DEV
  ? import.meta.env.VITE_ODD_COMPOSITION == `${BOOLEANTRUE}`
  : '{VITE_ODD_COMPOSITION}' == `${BOOLEANTRUE}`
export const ODD_PROCEDURE = import.meta.env.DEV
  ? import.meta.env.VITE_OODD_PROCEDURE == `${BOOLEANTRUE}`
  : '{VITE_OODD_PROCEDURE}' == `${BOOLEANTRUE}`
export const ODD_CLAIM = import.meta.env.DEV
  ? import.meta.env.VITE_ODD_CLAIM == `${BOOLEANTRUE}`
  : '{VITE_ODD_CLAIM}' == `${BOOLEANTRUE}`
export const ODD_CONDITION = import.meta.env.DEV
  ? import.meta.env.VITE_ODD_CONDITION == `${BOOLEANTRUE}`
  : '{VITE_ODD_CONDITION}' == `${BOOLEANTRUE}`
export const ODD_OBSERVATION = import.meta.env.DEV
  ? import.meta.env.VITE_ODD_OBSERVATION == `${BOOLEANTRUE}`
  : '{VITE_ODD_OBSERVATION}' == `${BOOLEANTRUE}`
export const ODD_MEDICATION = import.meta.env.DEV
  ? import.meta.env.VITE_ODD_MEDICATION == `${BOOLEANTRUE}`
  : '{VITE_ODD_MEDICATION}' == `${BOOLEANTRUE}`
export const ODD_CONTACT = import.meta.env.DEV
  ? import.meta.env.VITE_ODD_CONTACT == `${BOOLEANTRUE}`
  : '{VITE_ODD_CONTACT}' == `${BOOLEANTRUE}`
export const ODD_EXPORT = import.meta.env.DEV
  ? import.meta.env.VITE_ODD_EXPORT == `${BOOLEANTRUE}`
  : '{VITE_ODD_EXPORT}' == `${BOOLEANTRUE}`
export const ODD_FEASABILITY_REPORT = import.meta.env.DEV
  ? import.meta.env.VITE_ODD_FEASABILITY_REPORT == `${BOOLEANTRUE}`
  : '{VITE_ODD_FEASABILITY_REPORT}' == `${BOOLEANTRUE}`
export const ODD_QUESTIONNAIRE = import.meta.env.DEV
  ? import.meta.env.VITE_ODD_QUESTIONNAIRE == `${BOOLEANTRUE}`
  : '{VITE_ODD_QUESTIONNAIRE}' == `${BOOLEANTRUE}`

export const SESSION_TIMEOUT = import.meta.env.VITE_SESSION_TIMEOUT
  ? import.meta.env.VITE_SESSION_TIMEOUT
  : 780000 /* 13 * 60 * 1000 ms*/
export const REFRESH_TOKEN_INTERVAL = import.meta.env.VITE_REFRESH_TOKEN_INTERVAL
  ? import.meta.env.VITE_REFRESH_TOKEN_INTERVAL
  : 180000 /* 3 * 60 * 1000 ms*/
export const JTOOL_USERS = import.meta.env.VITE_JTOOL_USERS ? import.meta.env.VITE_JTOOL_USERS : '{VITE_JTOOL_USERS}'

export const VALUE_SET_SIZE = '9999'

export const EXPLORATION = 'Exploration'
