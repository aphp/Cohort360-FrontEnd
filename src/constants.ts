type ContextType = 'aphp' | 'arkhn' | 'fakedata'

export const ID_TOKEN_STORAGE_KEY = 'ARKHN_ID_TOKEN'
export const TOKEN_DATA_STORAGE_KEY = 'ARKHN_TOKEN_DATA'
export const STATE_STORAGE_KEY = 'ARKHN_AUTH_STATE'

export const {
  REACT_APP_CLIENT_ID: CLIENT_ID,
  REACT_APP_CLIENT_SECRET: CLIENT_SECRET,
  REACT_APP_BACK_API_URL: BACK_API_URL,
  REACT_APP_REQUEST_API_URL: REQUEST_API_URL,
  REACT_APP_FHIR_API_URL: FHIR_API_URL,
  REACT_APP_AUTH_API_URL: AUTH_API_URL,
  REACT_APP_FILES_URL: FILES_URL,
  REACT_APP_TOKEN_URL: TOKEN_URL,
  REACT_APP_REVOKE_URL: REVOKE_URL,
  REACT_APP_LOGIN_REDIRECT_URL: LOGIN_REDIRECT_URL,
  REACT_APP_FHIR_API_ADMIN_TOKEN: FHIR_API_ADMIN_TOKEN
} = process.env

export const API_RESOURCE_TAG = process.env.REACT_APP_DEV_API_RESOURCE_TAG
  ? '&_tag=' + process.env.REACT_APP_DEV_API_RESOURCE_TAG
  : ''
export const CONTEXT = process.env.REACT_APP_CONTEXT as ContextType

if (!CONTEXT) throw new Error('missing REACT_APP_CONTEXT from environment')
if (CONTEXT !== 'arkhn' && CONTEXT !== 'aphp' && CONTEXT !== 'fakedata') {
  throw new Error("REACT_APP_CONTEXT must be either 'aphp', 'fakedata' or 'arkhn")
}
export const ACCES_TOKEN = 'access'
export const REFRESH_TOKEN = 'refresh'
export const PRACTITIONER_ID = 'practitioner_id'
export const USERNAME_HEADER = 'username_header'
export const PERMISSION_STATUS_STRUCTURE_DEF_URL =
  'http://arkhn.com/fhir/cohort360/StructureDefinition/permission-status'
export const PRACTITIONER_CONSENT_PROFILE_URL =
  'http://arkhn.com/fhir/cohort360/StructureDefinition/practitioner-consent'
export const CONSENT_CATEGORIES_CODE_URL = 'http://terminology.hl7.org/CodeSystem/consentcategorycodes'
