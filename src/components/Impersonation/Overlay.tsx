import React, { useState } from 'react'
import { Button, IconButton } from '@mui/material'
import { useAppSelector, useAppDispatch } from 'state'
import { impersonate } from 'state/me'
import SwapVertIcon from '@mui/icons-material/SwapVert'

export default () => {
  const me = useAppSelector((state) => state.me)
  const dispatch = useAppDispatch()
  const [bottomPosition, setBottomPosition] = useState(true)

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
            bottom: bottomPosition ? 0 : undefined,
            top: bottomPosition ? undefined : 0,
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
          <div style={{ position: 'absolute', right: '1em' }}>
            <IconButton onClick={() => setBottomPosition((prev) => !prev)}>
              <SwapVertIcon color="primary" />
            </IconButton>
          </div>
        </div>
      </>
    )
  }

  return <div />
}
