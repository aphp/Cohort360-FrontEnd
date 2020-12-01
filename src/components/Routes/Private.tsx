import React, { useEffect } from 'react'
import { Route } from 'react-router'
import { Redirect } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { useQuery } from '@apollo/react-hooks'
import { gql } from 'apollo-boost'

import { ACCES_TOKEN } from '../../constants'
import { login } from '../../state/me'

import { useAppSelector } from 'state'

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
  const authToken = localStorage.getItem(ACCES_TOKEN)
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
      dispatch(login(me))
    }
  }, [me, data, dispatch])

  if (loading) return <span>Loading</span>

  if ((!me && !authToken) || error || (authToken && !loading && data && !data.me)) {
    return (
      <Route
        render={({ location }) => (
          <Redirect
            to={{
              pathname: '/',
              state: { from: location }
            }}
          />
        )}
      />
    )
  }

  return <Route {...props} />
}

export default PrivateRoute
