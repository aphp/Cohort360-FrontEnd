export let BOOLEANTRUE = 'true'

export const ACCES_TOKEN = 'access'
export const REFRESH_TOKEN = 'refresh'

export const CONTEXT = process.env.REACT_APP_CONTEXT ?? 'aphp'

export const BACK_API_URL =
  process.env.NODE_ENV !== 'development' ? '{REACT_APP_BACK_API_URL}' : process.env.REACT_APP_BACK_API_URL
export const REQUEST_API_URL =
  process.env.NODE_ENV !== 'development' ? '{REACT_APP_REQUEST_API_URL}' : process.env.REACT_APP_REQUEST_API_URL
export const FHIR_API_URL =
  process.env.NODE_ENV !== 'development' ? '{REACT_APP_FHIR_API_URL}' : process.env.REACT_APP_FHIR_API_URL
export const AUTH_API_URL =
  process.env.NODE_ENV !== 'development' ? '{REACT_APP_AUTH_API_URL}' : process.env.REACT_APP_AUTH_API_URL

export const CLAIM_HIERARCHY =
  process.env.NODE_ENV !== 'development'
    ? '{REACT_APP_VALUE_SET_URL_CLAIM_HIERARCHY}'
    : process.env.REACT_APP_VALUE_SET_URL_CLAIM_HIERARCHY

export const CONDITION_HIERARCHY =
  process.env.NODE_ENV !== 'development'
    ? '{REACT_APP_VALUE_SET_URL_CONDITION_HIERARCHY}'
    : process.env.REACT_APP_VALUE_SET_URL_CONDITION_HIERARCHY
export const CONDITION_STATUS =
  process.env.NODE_ENV !== 'development'
    ? '{REACT_APP_VALUE_SET_URL_CONDITION_STATUS}'
    : process.env.REACT_APP_VALUE_SET_URL_CONDITION_STATUS

export const PROCEDURE_HIERARCHY =
  process.env.NODE_ENV !== 'development'
    ? '{REACT_APP_VALUE_SET_URL_PROCEDURE_HIERARCHY}'
    : process.env.REACT_APP_VALUE_SET_URL_PROCEDURE_HIERARCHY

export const DEMOGRAPHIC_GENDER =
  process.env.NODE_ENV !== 'development'
    ? '{REACT_APP_VALUE_SET_URL_DEMOGRAPHIC_GENDER}'
    : process.env.REACT_APP_VALUE_SET_URL_DEMOGRAPHIC_GENDER

export const ENCOUNTER_ADMISSION_MODE =
  process.env.NODE_ENV !== 'development'
    ? '{REACT_APP_VALUE_SET_URL_ENCOUNTER_ADMISSION_MODE}'
    : process.env.REACT_APP_VALUE_SET_URL_ENCOUNTER_ADMISSION_MODE
export const ENCOUNTER_ENTRY_MODE =
  process.env.NODE_ENV !== 'development'
    ? '{REACT_APP_VALUE_SET_URL_ENCOUNTER_ENTRY_MODE}'
    : process.env.REACT_APP_VALUE_SET_URL_ENCOUNTER_ENTRY_MODE
export const ENCOUNTER_EXIT_MODE =
  process.env.NODE_ENV !== 'development'
    ? '{REACT_APP_VALUE_SET_URL_ENCOUNTER_EXIT_MODE}'
    : process.env.REACT_APP_VALUE_SET_URL_ENCOUNTER_EXIT_MODE
export const ENCOUNTER_VISIT_TYPE =
  process.env.NODE_ENV !== 'development'
    ? '{REACT_APP_VALUE_SET_URL_ENCOUNTER_VISIT_TYPE}'
    : process.env.REACT_APP_VALUE_SET_URL_ENCOUNTER_VISIT_TYPE
export const ENCOUNTER_SEJOUR_TYPE =
  process.env.NODE_ENV !== 'development'
    ? '{REACT_APP_VALUE_SET_URL_ENCOUNTER_SEJOUR_TYPE}'
    : process.env.REACT_APP_VALUE_SET_URL_ENCOUNTER_SEJOUR_TYPE
export const ENCOUNTER_FILE_STATUS =
  process.env.NODE_ENV !== 'development'
    ? '{REACT_APP_VALUE_SET_URL_ENCOUNTER_FILE_STATUS}'
    : process.env.REACT_APP_VALUE_SET_URL_ENCOUNTER_FILE_STATUS
export const ENCOUNTER_EXIT_TYPE =
  process.env.NODE_ENV !== 'development'
    ? '{REACT_APP_VALUE_SET_URL_ENCOUNTER_EXIT_TYPE}'
    : process.env.REACT_APP_VALUE_SET_URL_ENCOUNTER_EXIT_TYPE
export const ENCOUNTER_DESTINATION =
  process.env.NODE_ENV !== 'development'
    ? '{REACT_APP_VALUE_SET_URL_ENCOUNTER_DESTINATION}'
    : process.env.REACT_APP_VALUE_SET_URL_ENCOUNTER_DESTINATION
export const ENCOUNTER_PROVENANCE =
  process.env.NODE_ENV !== 'development'
    ? '{REACT_APP_VALUE_SET_URL_ENCOUNTER_PROVENANCE}'
    : process.env.REACT_APP_VALUE_SET_URL_ENCOUNTER_PROVENANCE
export const ENCOUNTER_ADMISSION =
  process.env.NODE_ENV !== 'development'
    ? '{REACT_APP_VALUE_SET_URL_ENCOUNTER_ADMISSION}'
    : process.env.REACT_APP_VALUE_SET_URL_ENCOUNTER_ADMISSION

export const MEDICATION_ATC =
  process.env.NODE_ENV !== 'development'
    ? '{REACT_APP_VALUE_SET_URL_MEDICATION_ATC}'
    : process.env.REACT_APP_VALUE_SET_URL_MEDICATION_ATC
export const MEDICATION_PRESCRIPTION_TYPES =
  process.env.NODE_ENV !== 'development'
    ? '{REACT_APP_VALUE_SET_URL_MEDICATION_PRESCRIPTION_TYPES}'
    : process.env.REACT_APP_VALUE_SET_URL_MEDICATION_PRESCRIPTION_TYPES
export const MEDICATION_ADMINISTRATIONS =
  process.env.NODE_ENV !== 'development'
    ? '{REACT_APP_VALUE_SET_URL_MEDICATION_ADMINISTRATIONS}'
    : process.env.REACT_APP_VALUE_SET_URL_MEDICATION_ADMINISTRATIONS

export const BIOLOGY_HIERARCHY_ITM_ANABIO =
  process.env.NODE_ENV !== 'development'
    ? '{REACT_APP_VALUE_SET_URL_BIOLOGY_ANABIO}'
    : process.env.REACT_APP_VALUE_SET_URL_BIOLOGY_ANABIO
export const BIOLOGY_HIERARCHY_ITM_LOINC =
  process.env.NODE_ENV !== 'development'
    ? '{REACT_APP_VALUE_SET_URL_BIOLOGY_LOINC}'
    : process.env.REACT_APP_VALUE_SET_URL_BIOLOGY_LOINC

export const ODD_BIOLOGY =
  process.env.NODE_ENV !== 'development'
    ? '{REACT_APP_ODD_BIOLOGY}' == `${BOOLEANTRUE}`
    : process.env.REACT_APP_ODD_BIOLOGY == `${BOOLEANTRUE}`

export const ODD_COMPOSITION =
  process.env.NODE_ENV !== 'development'
    ? '{REACT_APP_ODD_COMPOSITION}' == `${BOOLEANTRUE}`
    : process.env.REACT_APP_ODD_COMPOSITION == `${BOOLEANTRUE}`
export const ODD_PROCEDURE =
  process.env.NODE_ENV !== 'development'
    ? '{REACT_APP_OODD_PROCEDURE}' == `${BOOLEANTRUE}`
    : process.env.REACT_APP_OODD_PROCEDURE == `${BOOLEANTRUE}`
export const ODD_CLAIM =
  process.env.NODE_ENV !== 'development'
    ? '{REACT_APP_ODD_CLAIM}' == `${BOOLEANTRUE}`
    : process.env.REACT_APP_ODD_CLAIM == `${BOOLEANTRUE}`
export const ODD_CONDITION =
  process.env.NODE_ENV !== 'development'
    ? '{REACT_APP_ODD_CONDITION}' == `${BOOLEANTRUE}`
    : process.env.REACT_APP_ODD_CONDITION == `${BOOLEANTRUE}`
export const ODD_OBSERVATION =
  process.env.NODE_ENV !== 'development'
    ? '{REACT_APP_ODD_OBSERVATION}' == `${BOOLEANTRUE}`
    : process.env.REACT_APP_ODD_OBSERVATION == `${BOOLEANTRUE}`
export const ODD_MEDICATION =
  process.env.NODE_ENV !== 'development'
    ? '{REACT_APP_ODD_MEDICATION}' == `${BOOLEANTRUE}`
    : process.env.REACT_APP_ODD_MEDICATION == `${BOOLEANTRUE}`
export const ODD_CONTACT =
  process.env.NODE_ENV !== 'development'
    ? '{REACT_APP_ODD_CONTACT}' == `${BOOLEANTRUE}`
    : process.env.REACT_APP_ODD_CONTACT == `${BOOLEANTRUE}`
export const ODD_EXPORT =
  process.env.NODE_ENV !== 'development'
    ? '{REACT_APP_ODD_EXPORT}' == `${BOOLEANTRUE}`
    : process.env.REACT_APP_ODD_EXPORT == `${BOOLEANTRUE}`

export const SESSION_TIMEOUT = process.env.REACT_APP_SESSION_TIMEOUT
  ? process.env.REACT_APP_SESSION_TIMEOUT
  : 780000 /* 13 * 60 * 1000 ms*/
export const REFRESH_TOKEN_INTERVAL = process.env.REACT_APP_REFRESH_TOKEN_INTERVAL
  ? process.env.REACT_APP_REFRESH_TOKEN_INTERVAL
  : 180000 /* 3 * 60 * 1000 ms*/

export const VALUE_SET_SIZE = '9999'
