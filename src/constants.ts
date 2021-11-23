type ContextType = 'aphp' | 'arkhn' | 'fakedata'

export const ID_TOKEN_STORAGE_KEY = 'ARKHN_ID_TOKEN'
export const TOKEN_DATA_STORAGE_KEY = 'ARKHN_TOKEN_DATA'
export const STATE_STORAGE_KEY = 'ARKHN_AUTH_STATE'

export const {
  REACT_APP_CLIENT_ID: CLIENT_ID,
  REACT_APP_CLIENT_SECRET: CLIENT_SECRET,
  REACT_APP_BACK_API_URL: BACK_API_URL,
  REACT_APP_REQUEST_API_URL: REQUEST_API_URL,
  REACT_APP_PORTAIL_API_URL: PORTAIL_API_URL,
  REACT_APP_FHIR_API_URL: FHIR_API_URL,
  REACT_APP_AUTH_API_URL: AUTH_API_URL,
  REACT_APP_FILES_URL: FILES_URL,
  REACT_APP_TOKEN_URL: TOKEN_URL,
  REACT_APP_REVOKE_URL: REVOKE_URL,
  REACT_APP_LOGIN_REDIRECT_URL: LOGIN_REDIRECT_URL
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

export const CLAIM_HIERARCHY =
  process.env.REACT_APP_VALUE_SET_URL_CLAIM_HIERARCHY ?? 'https://terminology.eds.aphp.fr/aphp-orbis-ghm'

export const CONDITION_HIERARCHY =
  process.env.REACT_APP_VALUE_SET_URL_CONDITION_HIERARCHY ?? 'https://terminology.eds.aphp.fr/aphp-orbis-cim-'

export const CONDITION_STATUS =
  process.env.REACT_APP_VALUE_SET_URL_CONDITION_STATUS ?? 'https://terminology.eds.aphp.fr/aphp-orbis-condition-status'

export const PROCEDURE_HIERARCHY =
  process.env.REACT_APP_VALUE_SET_URL_PROCEDURE_HIERARCHY ?? 'https://terminology.eds.aphp.fr/aphp-orbis-ccam'

export const DEMOGRAPHIC_GENDER =
  process.env.REACT_APP_VALUE_SET_URL_DEMOGRAPHIC_GENDER ?? 'https://terminology.eds.aphp.fr/aphp-orbis-gender'

export const ENCOUNTER_ADMISSION_MODE =
  process.env.REACT_APP_VALUE_SET_URL_ENCOUNTER_ADMISSION_MODE ??
  'https://terminology.eds.aphp.fr/aphp-orbis-visit-motif-admission'

export const ENCOUNTER_ENTRY_MODE =
  process.env.REACT_APP_VALUE_SET_URL_ENCOUNTER_ENTRY_MODE ??
  'https://terminology.eds.aphp.fr/aphp-orbis-visit-mode-entree'

export const ENCOUNTER_EXIT_MODE =
  process.env.REACT_APP_VALUE_SET_URL_ENCOUNTER_EXIT_MODE ??
  'https://terminology.eds.aphp.fr/aphp-orbis-visit-mode-sortie'

export const ENCOUNTER_VISIT_TYPE =
  process.env.REACT_APP_VALUE_SET_URL_ENCOUNTER_VISIT_TYPE ?? 'https://terminology.eds.aphp.fr/aphp-orbis-visit-type'

export const ENCOUNTER_SEJOUR_TYPE =
  process.env.REACT_APP_VALUE_SET_URL_ENCOUNTER_SEJOUR_TYPE ?? 'https://terminology.eds.aphp.fr/aphp-orbis-type-sejour'

export const ENCOUNTER_FILE_STATUS =
  process.env.REACT_APP_VALUE_SET_URL_ENCOUNTER_FILE_STATUS ??
  'https://terminology.eds.aphp.fr/aphp-orbis-visite-status'

export const ENCOUNTER_EXIT_TYPE =
  process.env.REACT_APP_VALUE_SET_URL_ENCOUNTER_EXIT_TYPE ??
  'https://terminology.eds.aphp.fr/aphp-orbis-visit-type-sortie'

export const ENCOUNTER_DESTINATION =
  process.env.REACT_APP_VALUE_SET_URL_ENCOUNTER_DESTINATION ??
  'https://terminology.eds.aphp.fr/aphp-orbis-visit-destination'

export const ENCOUNTER_PROVENANCE =
  process.env.REACT_APP_VALUE_SET_URL_ENCOUNTER_PROVENANCE ??
  'https://terminology.eds.aphp.fr/aphp-orbis-visit-provenance'

export const ENCOUNTER_ADMISSION =
  process.env.REACT_APP_VALUE_SET_URL_ENCOUNTER_ADMISSION ??
  'https://terminology.eds.aphp.fr/aphp-orbis-visit-type-admission'

export const MEDICATION_ATC =
  process.env.REACT_APP_VALUE_SET_URL_MEDICATION_ATC ?? 'https://terminology.eds.aphp.fr/aphp-orbis-atc-medicament'

export const MEDICATION_PRESCRIPTION_TYPES =
  process.env.REACT_APP_VALUE_SET_URL_MEDICATION_PRESCRIPTION_TYPES ??
  'https://terminology.eds.aphp.fr/aphp-orbis-medicament-type-prescription'

export const MEDICATION_ADMINISTRATIONS =
  process.env.REACT_APP_VALUE_SET_URL_MEDICATION_ADMINISTRATIONS ??
  'https://terminology.eds.aphp.fr/aphp-orbis-medicament-voie-administration'
