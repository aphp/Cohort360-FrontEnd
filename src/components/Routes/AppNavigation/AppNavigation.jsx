import React from 'react'
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom'

import LeftSideBar from 'components/LeftSideBar/LeftSideBar'
import Snackbar from 'components/Snackbar/Snackbar'

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
    <Switch>
      {Config.map((route) => {
        const MyComponent = route.component

        return (
          <Route
            key={route.name}
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
    </Switch>
  </Router>
)

export default AppNavigation
