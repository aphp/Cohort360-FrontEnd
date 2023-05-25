import React, { useEffect } from 'react'
import { ACCES_TOKEN, REFRESH_TOKEN } from '../../constants'
import apiBackend from '../../services/apiBackend'
import { CircularProgress } from '@mui/material'
import { useNavigate } from 'react-router'

const getTokens = async (auth_code: string) => {
  try {
    const res = await apiBackend.post(`/auth/oidc/login`, { code: auth_code })
    if (res.status === 200) {
      return res.data
    }
  } catch (error) {
    console.error(error)
  }
}

const OIDCCallbackHandler: React.FC = () => {
  const navigate = useNavigate()
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const code: any = urlParams.get('code')
    getTokens(code).then((data) => {
      localStorage.setItem(ACCES_TOKEN, data.jwt.access)
      localStorage.setItem(REFRESH_TOKEN, data.jwt.refresh)
      navigate('/home')
    })
  }, [])

  return (
    <div>
      Authenticating...
      <CircularProgress />
    </div>
  )
}

export default OIDCCallbackHandler
