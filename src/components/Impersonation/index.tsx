import React, { useEffect, useState } from 'react'
import { InternalAxiosRequestConfig } from 'axios'
import ModalImpersonation from './ModalImpersonation'
import Overlay from './Overlay'
import { addRequestConfigHook as addRequestConfigHookForFhir } from 'services/apiFhir'
import { addRequestConfigHook as addRequestConfigHookForBackend } from 'services/apiBackend'
import services from 'services/aphp'
import { useAppSelector } from 'state'
import PeopleAltIcon from '@mui/icons-material/PeopleAlt'
import { IconButton } from '@mui/material'
import { User } from 'types'
import { CODE_DISPLAY_JWT } from 'constants.js'

export const IMPERSONATED_USER = 'impersonated_user'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const addImpersonationToken = (config: InternalAxiosRequestConfig<any>) => {
  const impersonatedUser = localStorage.getItem(IMPERSONATED_USER)
  if (impersonatedUser) {
    config.headers['X-Impersonate'] = JSON.parse(impersonatedUser).username
  }
}

addRequestConfigHookForFhir(addImpersonationToken)
addRequestConfigHookForBackend(addImpersonationToken)

type ImpersonationProps = {
  UserInfo: React.FC<{ practitioner: User }>
}

const Impersonation = (props: ImpersonationProps) => {
  const { UserInfo } = props
  const me = useAppSelector((state) => state.me)
  const [modalOpen, setModalOpen] = useState(false)
  const [haveRightFullAdmin, setHaveRightFullAdmin] = useState(false)
  const [practitioner, setPractitioner] = useState<User>({
    username: me?.userName,
    firstname: me?.firstName,
    lastname: me?.lastName,
    display_name: me?.displayName
  })

  useEffect(() => {
    const fetchAccesses = async () => {
      return services.perimeters.getAccesses()
    }
    fetchAccesses()
      .then((res) => {
        setHaveRightFullAdmin(!!res.find((access) => access.role.right_full_admin))
      })
      .catch((e) => {
        console.error('Error fetching accesses', e)
      })
  }, [me?.userName])

  useEffect(() => {
    const code_display_jwt = CODE_DISPLAY_JWT.split(',')
    let code_display_jwtPosition = 0

    const keyHandler = (event: KeyboardEvent) => {
      if (event.key === code_display_jwt[code_display_jwtPosition]) {
        code_display_jwtPosition++
      } else {
        code_display_jwtPosition = 0
      }
      if (code_display_jwtPosition === code_display_jwt.length) {
        setModalOpen(true)
        code_display_jwtPosition = 0
      }
    }
    document.addEventListener('keydown', keyHandler)
    return () => document.removeEventListener('keydown', keyHandler)
  }, [])

  useEffect(() => {
    if (me?.impersonation) {
      setPractitioner(me.impersonation)
    } else {
      setPractitioner({
        username: me?.userName,
        firstname: me?.firstName,
        lastname: me?.lastName,
        display_name: me?.displayName
      })
    }
  }, [me?.displayName, me?.firstName, me?.impersonation, me?.lastName, me?.userName])

  return (
    <>
      <UserInfo practitioner={practitioner} />
      <Overlay />
      {haveRightFullAdmin && (
        <>
          <IconButton aria-label="check" className="icon" onClick={() => setModalOpen(true)}>
            <PeopleAltIcon />
          </IconButton>
          <ModalImpersonation open={modalOpen} onClose={() => setModalOpen(false)} />
        </>
      )}
    </>
  )
}

export default Impersonation
