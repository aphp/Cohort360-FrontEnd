import React from 'react'
import { BrowserRouter as Router, Switch, Route, Redirect } from 'react-router-dom'

import LeftSideBar from 'components/LeftSideBar/LeftSideBar'
import Snackbar from 'components/Snackbar/Snackbar'

import PrivateRoute from '../Private'
import AutoLogoutContainer from '../AutoLogoutContainer'

import Config from './config'

const Layout = (props) => {
  return (
    <>
      {props.displaySideBar && <LeftSideBar />}

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
      {/* 404 not found */}
      <Route>
        <Redirect to="/" />
      </Route>
    </Switch>
  </Router>
)

export default AppNavigation
