import React, { useState } from 'react'
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom'

import { Snackbar } from '@material-ui/core'
import { Alert } from '@material-ui/lab'

import LeftSideBar from 'components/LeftSideBar/LeftSideBar'

import Config from './config'

const Layout = (props) => {
  const [open, setOpen] = useState(true)

  return (
    <>
      {props.displaySideBar && <LeftSideBar />}
      {props.children}

      <Snackbar
        open={open}
        autoHideDuration={5000}
        onClose={() => setOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={() => setOpen(false)} color="success" severity="success">
          This is a success message!
        </Alert>
      </Snackbar>
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
