import React, { useEffect, useState } from 'react'
import { Route } from 'react-router'
import { Redirect, useLocation } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { useQuery } from '@apollo/react-hooks'
import { gql } from 'apollo-boost'

import { Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Button } from '@material-ui/core'

import { ACCES_TOKEN } from '../../constants'

import { useAppSelector } from 'state'
import { login } from 'state/me'

const ME = gql`
  query me {
    me {
      id
      name
      email
    }
  }
`

type Props = React.ComponentProps<typeof Route>

const PrivateRoute: React.FC<Props> = (props) => {
  const me = useAppSelector((state) => state.me)
  const dispatch = useDispatch()
  const location = useLocation()
  const authToken = localStorage.getItem(ACCES_TOKEN)

  const [allowRedirect, setRedirection] = useState(false)

  const { data, loading, error } = useQuery(ME, {
    context: {
      headers: {
        Authorization: `Bearer ${authToken}`
      }
    },
    skip: !authToken || null !== me
  })

  useEffect(() => {
    if (!me && data && data.me) {
      dispatch<any>(login(me))
    }
  }, [me, data, dispatch])

  if (!me || (!me && !authToken) || error || (authToken && !loading && data && !data.me)) {
    if (allowRedirect === true)
      return (
        <Redirect
          to={{
            pathname: '/',
            state: { from: location }
          }}
        />
      )

    return (
      <Dialog open aria-labelledby="alert-dialog-title" aria-describedby="alert-dialog-description">
        <DialogTitle id="alert-dialog-title">{''}</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Il semblerait que vous n'êtes plus connecté. Vous allez être redirigé vers la page de connexion
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              localStorage.setItem('old-path', location.pathname)
              setRedirection(true)
            }}
            color="primary"
            autoFocus
          >
            Ok
          </Button>
        </DialogActions>
      </Dialog>
    )
  }

  return <Route {...props} />
}

export default PrivateRoute
