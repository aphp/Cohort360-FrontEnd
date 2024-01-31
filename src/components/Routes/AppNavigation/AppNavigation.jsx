import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'

import { useAppSelector } from 'state/index'

import configRoutes from './config'
import PrivateRoute from '../PrivateRoute'
import LeftSideBar from '../LeftSideBar/LeftSideBar'
import AutoLogoutContainer from '../AutoLogoutContainer'
import { WebSocketProvider } from 'components/WebSocket/WebSocketProvider'

const Layout = (props) => {
  const me = useAppSelector((state) => state.me)

  return (
    <>
      {me && <AutoLogoutContainer />}

      {props.displaySideBar && <LeftSideBar open />}

      {props.children}
    </>
  )
}

const AppNavigation = () => (
  <Router>
    <Routes>
      {configRoutes.map((route, index) => {
        return route.isPrivate ? (
          <Route key={index} element={<PrivateRoute />}>
            <Route
              key={index}
              path={route.path}
              element={
                <WebSocketProvider>
                  <Layout displaySideBar={route.displaySideBar}>{route.element}</Layout>
                </WebSocketProvider>
              }
              param
            />
          </Route>
        ) : (
          <Route
            key={index}
            path={route.path}
            element={<Layout displaySideBar={route.displaySideBar}>{route.element}</Layout>}
          />
        )
      })}
    </Routes>
  </Router>
)

export default AppNavigation
