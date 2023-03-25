import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'

import { useAppSelector } from 'state/index'

import configRoutes from './config'
import PrivateRoute from '../PrivateRoute'
import LeftSideBar from '../LeftSideBar/LeftSideBar'
import AutoLogoutContainer from '../AutoLogoutContainer'

const Layout = (props) => {
  const me = useAppSelector((state) => state.me)

  return (
    <>
      {me && <AutoLogoutContainer />}

      {props.displaySideBar && <LeftSideBar />}

      {props.children}
    </>
  )
}

const AppNavigation = () => (
  <Router>
    <Routes>
      {configRoutes.map((route, index) => {
        return route.isPrivate ? (
          <Route element={<PrivateRoute />}>
            <Route
              index={index}
              path={route.path}
              element={<Layout displaySideBar={route.displaySideBar}>{route.element}</Layout>}
            />
          </Route>
        ) : (
          <Route
            index={index}
            path={route.path}
            element={<Layout displaySideBar={route.displaySideBar}>{route.element}</Layout>}
          />
        )
      })}
      {/* <Route path="*" element={<PageNotFound />} /> */}
    </Routes>
  </Router>
)

export default AppNavigation
