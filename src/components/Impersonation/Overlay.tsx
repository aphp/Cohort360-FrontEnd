import { Button } from '@mui/material'
import React from 'react'
import { useAppSelector, useAppDispatch } from 'state'
import { impersonate } from 'state/me'

export default () => {
  const me = useAppSelector((state) => state.me)
  const dispatch = useAppDispatch()

  const stopImpersonation = () => {
    dispatch(impersonate(undefined))
  }

  if (me && me.impersonation) {
    return (
      <>
        <div
          style={{
            width: '100%',
            backgroundColor: '#ffac41',
            position: 'fixed',
            bottom: 0,
            left: 0,
            height: '3em',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 9999999
          }}
        >
          <div>{`Vous impersonnifiez l'utilisateur: ${me.impersonation.display_name}`}</div>
          <div
            style={{
              marginLeft: '1em'
            }}
          >
            <Button onClick={stopImpersonation}>Arrêter</Button>
          </div>
        </div>
      </>
    )
  }

  return <div />
}
