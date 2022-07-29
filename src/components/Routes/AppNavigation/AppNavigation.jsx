import React from 'react'
import { BrowserRouter as Router, Switch, Route, Redirect } from 'react-router-dom'

import Snackbar from 'components/Snackbar/Snackbar'

import PrivateRoute from '../Private'
import LeftSideBar from '../LeftSideBar/LeftSideBar'
import AutoLogoutContainer from '../AutoLogoutContainer'

import Config from './config'

const Layout = (props) => {
  return (
    <>
      {props.displaySideBar && <LeftSideBar open={props.name === 'accueil'} />}

      {props.children}

      <Snackbar />
    </>
  )
}

const AppNavigation = () => (
  <Router>
    <AutoLogoutContainer />

    <Switch>
      {Config.map((route, index) => {
        const MyComponent = route.component

        return route.isPrivate ? (
          <PrivateRoute
            key={index}
            exact={route.exact}
            path={route.path}
            render={(props) => {
              return (
                <Layout {...route}>
                  <MyComponent {...props} context={route.context} />
                </Layout>
              )
            }}
          />
        ) : (
          <Route
            key={index}
            exact={route.exact}
            path={route.path}
            render={(props) => {
              return (
                <Layout {...route}>
                  <MyComponent {...props} context={route.context} />
                </Layout>
              )
            }}
          />
        )
      })}
      <Route>
        <Redirect to="/" />
      </Route>
    </Switch>
  </Router>
)

export default AppNavigation
