import React, { PropsWithChildren } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'

import { useAppSelector } from 'state/index'

import configRoutes from './config'
import PrivateRoute from '../PrivateRoute'
import LeftSideBar from '../LeftSideBar/LeftSideBar'
import AutoLogoutContainer from '../AutoLogoutContainer'
import { WebSocketProvider } from 'components/WebSocket/WebSocketProvider'
import Maintenance from 'views/Maintenance'
import Snackbar from 'components/Snackbar/Snackbar'

type LayoutProps = {
  displaySideBar: boolean
}

const Layout = (props: PropsWithChildren<LayoutProps>) => {
  const me = useAppSelector((state) => state.me)

  return (
    <>
      {me && <AutoLogoutContainer />}
      {props.displaySideBar && <LeftSideBar open />}
      {props.children}
      <Snackbar />
    </>
  )
}

const AppNavigation = () => {
  const maintenance = useAppSelector((state) => state.me?.maintenance)
  if (maintenance?.active && maintenance?.type === 'full') {
    return <Maintenance />
  }
  return (
    <Router>
      <Routes>
        {configRoutes.map((route, index) => {
          return route.isPrivate ? (
            <Route key={index + route.name} element={<PrivateRoute />}>
              <Route
                key={index + route.name}
                path={route.path}
                element={
                  <WebSocketProvider>
                    <Layout displaySideBar={route.displaySideBar}>{route.element}</Layout>
                  </WebSocketProvider>
                }
              />
            </Route>
          ) : (
            <Route
              key={index + route.name}
              path={route.path}
              element={<Layout displaySideBar={route.displaySideBar}>{route.element}</Layout>}
            />
          )
        })}
      </Routes>
    </Router>
  )
}

export default AppNavigation
