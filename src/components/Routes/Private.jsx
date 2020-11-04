import * as React from 'react'
import PropTypes from 'prop-types'
import { Route } from 'react-router'
import { Redirect } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { useQuery } from '@apollo/react-hooks'
import { gql } from 'apollo-boost'

import { ACCES_TOKEN } from '../../constants'
import { login } from '../../state/me'

const ME = gql`
  query me {
    me {
      id
      name
      email
    }
  }
`

const PrivateRoute = ({ component: Component, render, ...rest }) => {
  const me = useSelector((state) => state.me)
  const dispatch = useDispatch()
  const authToken = localStorage.getItem(ACCES_TOKEN)
  const { data, loading, error } = useQuery(ME, {
    context: {
      headers: {
        Authorization: `Bearer ${authToken}`
      }
    },
    skip: !authToken || me
  })

  React.useEffect(() => {
    if (!me && data && data.me) {
      const { id, name, email } = data.me
      dispatch(login(id, name, email))
    }
  }, [me, data, dispatch])

  if (loading) return <span>Loading</span>

  if (
    (!me && !authToken) ||
    error ||
    (authToken && !loading && data && !data.me)
  ) {
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

  return (
    <Route
      {...rest}
      render={(props) => (render ? render(props) : <Component {...props} />)}
    />
  )
}

PrivateRoute.propTypes = {
  component: PropTypes.elementType,
  render: PropTypes.func
}

export default PrivateRoute
