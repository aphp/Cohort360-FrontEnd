const ENV_CONFIG_URL = import.meta.env.DEV ? import.meta.env.VITE_CONFIG_URL : '{VITE_CONFIG_URL}'
export const CONFIG_URL = !!`${ENV_CONFIG_URL}`.match('VITE_CONFIG_URL')
  ? '/config.json'
  : `${ENV_CONFIG_URL}` || '/config.json'

export const ACCESS_TOKEN = 'access_token'
export const REFRESH_TOKEN = 'refresh_token'
export const IMPERSONATED_USER = 'impersonated_user'

export const EXPLORATION = 'Exploration'
