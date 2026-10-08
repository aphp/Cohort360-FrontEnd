import React, { PropsWithChildren, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router'

import { useAppSelector } from 'state/index'

import configRoutes from './config'
import PrivateRoute from '../PrivateRoute'
import LeftSideBar from '../LeftSideBar/LeftSideBar'
import AutoLogoutContainer from '../AutoLogoutContainer'
import { WebSocketProvider } from 'components/WebSocket/WebSocketProvider'
import Maintenance from 'views/Maintenance'
import Snackbar from 'components/Snackbar/Snackbar'
import { isSessionLostAfterStorageChange, leaveSession } from 'utils/sessionUser'

type LayoutProps = {
  displaySideBar: boolean
}

const CrossTabAuthSync = () => {
  useEffect(() => {
    const onStorageChange = (e: StorageEvent) => {
      if (isSessionLostAfterStorageChange(e.key)) {
        leaveSession()
      }
    }
    window.addEventListener('storage', onStorageChange)
    return () => window.removeEventListener('storage', onStorageChange)
  }, [])

  return null
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
      <CrossTabAuthSync />
      <Routes>
        {configRoutes().map((route, index) => {
          return route.isPrivate ? (
            // TODO: supprimer la props name qui ne sert à rien sauf pour la key (enfin, à vérifier)
            <Route key={index + route.name} element={<PrivateRoute />}>
              <Route
                key={index + route.name}
                path={route.path}
                element={
                  <WebSocketProvider>
                    <Layout displaySideBar={route.displaySideBar}>{route.element}</Layout>
                  </WebSocketProvider>
                }
              >
                {route.children?.map((child, index) => (
                  <Route key={index + (child.path ?? '')} path={child.path} element={child.element} />
                ))}
              </Route>
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
