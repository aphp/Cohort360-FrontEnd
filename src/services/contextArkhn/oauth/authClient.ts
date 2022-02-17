import ClientOAuth2 from 'client-oauth2'
import { CLIENT_ID, CLIENT_SECRET, AUTH_API_URL, TOKEN_URL, LOGIN_REDIRECT_URL } from '../../../constants'

export const authClient = new ClientOAuth2({
  clientId: CLIENT_ID,
  // NOTE With the client-oauth2 lib, refresh doesn't work if no secret is provided
  // so we give a dummy secret here. It's not more dangerous than having no authentication
  // scheme at all and didn't find a way to securely authenticate a public client with Hydra
  clientSecret: CLIENT_SECRET,
  authorizationUri: AUTH_API_URL,
  accessTokenUri: TOKEN_URL,
  redirectUri: LOGIN_REDIRECT_URL,
  scopes: ['openid', 'offline_access']
})
