export const ID_TOKEN_STORAGE_KEY = 'ARKHN_ID_TOKEN'
export const TOKEN_DATA_STORAGE_KEY = 'ARKHN_TOKEN_DATA'
export const STATE_STORAGE_KEY = 'ARKHN_AUTH_STATE'

export const CLIENT_ID = 'irrelevant'
export const CLIENT_SECRET = 'irrelevant'
export const BACK_API_URL =
  process.env.NODE_ENV !== 'development' ? '{BACK_API_URL}' : process.env.REACT_APP_BACK_API_URL
export const REQUEST_API_URL =
  process.env.NODE_ENV !== 'development' ? '{REQUEST_API_URL}' : process.env.REACT_APP_REQUEST_API_URL
export const FHIR_API_URL =
  process.env.NODE_ENV !== 'development' ? '{FHIR_API_URL}' : process.env.REACT_APP_FHIR_API_URL
export const AUTH_API_URL =
  process.env.NODE_ENV !== 'development' ? '{AUTH_API_URL}' : process.env.REACT_APP_AUTH_API_URL
export const FILES_URL = 'irrelevant'
export const TOKEN_URL = 'irrelevant'
export const REVOKE_URL = 'irrelevant'
export const LOGIN_REDIRECT_URL = 'irrelevant'

export const CONTEXT = process.env.NODE_ENV !== 'development' ? '{CONTEXT}' : process.env.REACT_APP_CONTEXT

export const ACCES_TOKEN = 'access'
export const REFRESH_TOKEN = 'refresh'

export const CLAIM_HIERARCHY =
  process.env.NODE_ENV !== 'development' ? '{CLAIM_HIERARCHY}' : process.env.REACT_APP_VALUE_SET_URL_CLAIM_HIERARCHY
export const CONDITION_HIERARCHY =
  process.env.NODE_ENV !== 'development'
    ? '{CONDITION_HIERARCHY}'
    : process.env.REACT_APP_VALUE_SET_URL_CONDITION_HIERARCHY
export const CONDITION_STATUS =
  process.env.NODE_ENV !== 'development' ? '{CONDITION_STATUS}' : process.env.REACT_APP_VALUE_SET_URL_CONDITION_STATUS
export const PROCEDURE_HIERARCHY =
  process.env.NODE_ENV !== 'development'
    ? '{PROCEDURE_HIERARCHY}'
    : process.env.REACT_APP_VALUE_SET_URL_PROCEDURE_HIERARCHY
export const DEMOGRAPHIC_GENDER =
  process.env.NODE_ENV !== 'development'
    ? '{DEMOGRAPHIC_GENDER}'
    : process.env.REACT_APP_VALUE_SET_URL_DEMOGRAPHIC_GENDER

export const ENCOUNTER_ADMISSION_MODE =
  process.env.NODE_ENV !== 'development'
    ? '{ENCOUNTER_ADMISSION_MODE}'
    : process.env.REACT_APP_VALUE_SET_URL_ENCOUNTER_ADMISSION_MODE

export const ENCOUNTER_ENTRY_MODE =
  process.env.NODE_ENV !== 'development'
    ? '{ENCOUNTER_ENTRY_MODE}'
    : process.env.REACT_APP_VALUE_SET_URL_ENCOUNTER_ENTRY_MODE

export const ENCOUNTER_EXIT_MODE =
  process.env.NODE_ENV !== 'development'
    ? '{ENCOUNTER_EXIT_MODE}'
    : process.env.REACT_APP_VALUE_SET_URL_ENCOUNTER_EXIT_MODE

export const ENCOUNTER_VISIT_TYPE =
  process.env.NODE_ENV !== 'development'
    ? '{ENCOUNTER_VISIT_TYPE}'
    : process.env.REACT_APP_VALUE_SET_URL_ENCOUNTER_VISIT_TYP

export const ENCOUNTER_SEJOUR_TYPE =
  process.env.NODE_ENV !== 'development'
    ? '{ENCOUNTER_SEJOUR_TYPE}'
    : process.env.REACT_APP_VALUE_SET_URL_ENCOUNTER_SEJOUR_TYPE

export const ENCOUNTER_FILE_STATUS =
  process.env.NODE_ENV !== 'development'
    ? '{ENCOUNTER_FILE_STATUS}'
    : process.env.REACT_APP_VALUE_SET_URL_ENCOUNTER_FILE_STATUS

export const ENCOUNTER_EXIT_TYPE =
  process.env.NODE_ENV !== 'development'
    ? '{ENCOUNTER_EXIT_TYPE}'
    : process.env.REACT_APP_VALUE_SET_URL_ENCOUNTER_EXIT_TYPE

export const ENCOUNTER_DESTINATION =
  process.env.NODE_ENV !== 'development'
    ? '{ENCOUNTER_DESTINATION}'
    : process.env.REACT_APP_VALUE_SET_URL_ENCOUNTER_DESTINATION

export const ENCOUNTER_PROVENANCE =
  process.env.NODE_ENV !== 'development'
    ? '{ENCOUNTER_PROVENANCE}'
    : process.env.REACT_APP_VALUE_SET_URL_ENCOUNTER_PROVENANCE

export const ENCOUNTER_ADMISSION =
  process.env.NODE_ENV !== 'development'
    ? '{ENCOUNTER_ADMISSION}'
    : process.env.REACT_APP_VALUE_SET_URL_ENCOUNTER_ADMISSION

export const MEDICATION_ATC =
  process.env.NODE_ENV !== 'development' ? '{MEDICATION_ATC}' : process.env.REACT_APP_VALUE_SET_URL_MEDICATION_ATC

export const MEDICATION_PRESCRIPTION_TYPES =
  process.env.NODE_ENV !== 'development'
    ? '{MEDICATION_PRESCRIPTION_TYPES}'
    : process.env.REACT_APP_VALUE_SET_URL_MEDICATION_PRESCRIPTION_TYPES

export const MEDICATION_ADMINISTRATIONS =
  process.env.NODE_ENV !== 'development'
    ? '{MEDICATION_ADMINISTRATIONS}'
    : process.env.REACT_APP_VALUE_SET_URL_MEDICATION_ADMINISTRATIONS

export const BIOLOGY_HIERARCHY_ITM_ANABIO =
  process.env.NODE_ENV !== 'development'
    ? '{BIOLOGY_HIERARCHY_ITM_ANABIO}'
    : process.env.REACT_APP_VALUE_SET_URL_BIOLOGY_ANABIO

export const BIOLOGY_HIERARCHY_ITM_LOINC =
  process.env.NODE_ENV !== 'development'
    ? '{BIOLOGY_HIERARCHY_ITM_LOINC}'
    : process.env.REACT_APP_VALUE_SET_URL_BIOLOGY_LOINC

export const ODD_BIOLOGY =
  (process.env.NODE_ENV !== 'development' ? '{ODD_BIOLOGY}' : process.env.REACT_APP_ODD_BIOLOGY) === 'true'
export const ODD_COMPOSITION =
  (process.env.NODE_ENV !== 'development' ? '{ODD_COMPOSITION}' : process.env.REACT_APP_ODD_COMPOSITION) === 'true'
export const ODD_PROCEDURE =
  (process.env.NODE_ENV !== 'development' ? '{ODD_PROCEDURE}' : process.env.REACT_APP_OODD_PROCEDURE) === 'true'
export const ODD_CLAIM =
  (process.env.NODE_ENV !== 'development' ? '{ODD_CLAIM}' : process.env.REACT_APP_ODD_CLAIM) === 'true'
export const ODD_CONDITION =
  (process.env.NODE_ENV !== 'development' ? '{ODD_CONDITION}' : process.env.REACT_APP_ODD_CONDITION) === 'true'
export const ODD_OBSERVATION =
  (process.env.NODE_ENV !== 'development' ? '{ODD_OBSERVATION}' : process.env.REACT_APP_ODD_OBSERVATION) === 'true'
export const ODD_MEDICATION =
  (process.env.NODE_ENV !== 'development' ? '{ODD_MEDICATION}' : process.env.REACT_APP_ODD_MEDICATION) === 'true'
export const ODD_CONTACT =
  (process.env.NODE_ENV !== 'development' ? '{ODD_CONTACT}' : process.env.REACT_APP_ODD_CONTACT) === 'true'
export const ODD_EXPORT =
  (process.env.NODE_ENV !== 'development' ? '{ODD_EXPORT}' : process.env.REACT_APP_ODD_EXPORT) === 'true'

console.log('ID_TOKEN_STORAGE_KEY', ID_TOKEN_STORAGE_KEY)
console.log('TOKEN_DATA_STORAGE_KEY', TOKEN_DATA_STORAGE_KEY)
console.log('STATE_STORAGE_KEY', STATE_STORAGE_KEY)
console.log('CLIENT_ID', CLIENT_ID)
console.log('CLIENT_SECRET', CLIENT_SECRET)
console.log('BACK_API_URL', BACK_API_URL)
console.log('REQUEST_API_URL', REQUEST_API_URL)
console.log('FHIR_API_URL', FHIR_API_URL)
console.log('AUTH_API_URL', AUTH_API_URL)
console.log('FILES_URL', FILES_URL)
console.log('TOKEN_URL', TOKEN_URL)
console.log('REVOKE_URL', REVOKE_URL)
console.log('LOGIN_REDIRECT_URL', LOGIN_REDIRECT_URL)
console.log('CONTEXT', CONTEXT)
console.log('ACCES_TOKEN', ACCES_TOKEN)
console.log('REFRESH_TOKEN', REFRESH_TOKEN)
console.log('CLAIM_HIERARCHY', CLAIM_HIERARCHY)
console.log('CONDITION_HIERARCHY', CONDITION_HIERARCHY)
console.log('CONDITION_STATUS', CONDITION_STATUS)
console.log('PROCEDURE_HIERARCHY', PROCEDURE_HIERARCHY)
console.log('DEMOGRAPHIC_GENDER', DEMOGRAPHIC_GENDER)
console.log('ENCOUNTER_ADMISSION_MODE', ENCOUNTER_ADMISSION_MODE)
console.log('ENCOUNTER_ENTRY_MODE', ENCOUNTER_ENTRY_MODE)
console.log('ENCOUNTER_EXIT_MODE', ENCOUNTER_EXIT_MODE)
console.log('ENCOUNTER_VISIT_TYPE', ENCOUNTER_VISIT_TYPE)
console.log('ENCOUNTER_SEJOUR_TYPE', ENCOUNTER_SEJOUR_TYPE)
console.log('ENCOUNTER_FILE_STATUS', ENCOUNTER_FILE_STATUS)
console.log('ENCOUNTER_EXIT_TYPE', ENCOUNTER_EXIT_TYPE)
console.log('ENCOUNTER_DESTINATION', ENCOUNTER_DESTINATION)
console.log('ENCOUNTER_PROVENANCE', ENCOUNTER_PROVENANCE)
console.log('ENCOUNTER_ADMISSION', ENCOUNTER_ADMISSION)
console.log('MEDICATION_ATC', MEDICATION_ATC)
console.log('MEDICATION_PRESCRIPTION_TYPES', MEDICATION_PRESCRIPTION_TYPES)
console.log('MEDICATION_ADMINISTRATIONS', MEDICATION_ADMINISTRATIONS)
console.log('BIOLOGY_HIERARCHY_ITM_ANABIO', BIOLOGY_HIERARCHY_ITM_ANABIO)
console.log('BIOLOGY_HIERARCHY_ITM_LOINC', BIOLOGY_HIERARCHY_ITM_LOINC)
console.log('ODD_BIOLOGY', ODD_BIOLOGY)
console.log('ODD_COMPOSITION', ODD_COMPOSITION)
console.log('ODD_PROCEDURE', ODD_PROCEDURE)
console.log('ODD_CLAIM', ODD_CLAIM)
console.log('ODD_CONDITION', ODD_CONDITION)
console.log('ODD_OBSERVATION', ODD_OBSERVATION)
console.log('ODD_MEDICATION', ODD_MEDICATION)
console.log('ODD_CONTACT', ODD_CONTACT)
console.log('ODD_EXPORT', ODD_EXPORT)
console.log('NODE_ENV', process.env.NODE_ENV)
