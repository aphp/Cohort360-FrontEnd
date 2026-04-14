import React, { PropsWithChildren, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom'

import { useAppSelector } from 'state/index'

import configRoutes from './config'
import PrivateRoute from '../PrivateRoute'
import LeftSideBar from '../LeftSideBar/LeftSideBar'
import AutoLogoutContainer from '../AutoLogoutContainer'
import { WebSocketProvider } from 'components/WebSocket/WebSocketProvider'
import Maintenance from 'views/Maintenance'
import Snackbar from 'components/Snackbar/Snackbar'
import { ACCESS_TOKEN } from 'constants.js'

type LayoutProps = {
  displaySideBar: boolean
}

const CrossTabAuthSync = () => {
  const navigate = useNavigate()

  useEffect(() => {
    const onStorageChange = (e: StorageEvent) => {
      if (e.key === ACCESS_TOKEN && !e.newValue && window.location.pathname !== '/') {
        navigate('/', { replace: true })
      }
    }
    window.addEventListener('storage', onStorageChange)
    return () => window.removeEventListener('storage', onStorageChange)
  }, [navigate])

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
                {route.children &&
                  route.children.map((child, index) => (
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
