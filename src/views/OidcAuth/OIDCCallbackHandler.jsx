import React, { useEffect } from 'react'
import { OIDC_ACCES_TOKEN, OIDC_REFRESH_TOKEN } from '../../constants'
import apiBackend from '../../services/apiBackend'
import { CircularProgress } from '@mui/material'

const get_tokens_and_forward = async (auth_code) => {
  try {
    const res = await apiBackend.get(`/auth/oidc/access-tokens/?code=${auth_code}`)
    if (res.status === 200) {
      localStorage.setItem(OIDC_ACCES_TOKEN, res.data.access_token)
      localStorage.setItem(OIDC_REFRESH_TOKEN, res.data.refresh_token)
      window.location = 'http://localhost:8001/home'
    }
  } catch (error) {
    console.error(error)
  }
}

const OIDCCallbackHandler = () => {
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const code = urlParams.get('code')
    get_tokens_and_forward(code)
  }, [])

  return (
    <div>
      Authenticating...
      <CircularProgress />
    </div>
  )
}

export default OIDCCallbackHandler
