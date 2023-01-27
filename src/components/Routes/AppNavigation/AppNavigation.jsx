import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'

import Snackbar from '../..//Snackbar/Snackbar'

import PrivateRoute from '../Private'
import LeftSideBar from '../LeftSideBar/LeftSideBar'
import AutoLogoutContainer from '../AutoLogoutContainer'

import Login from '../../../views/Login/Login'
import HealthCheck from '../../../views/HealthCheck/HealthCheck'
import Welcome from '../../../views/Welcome/Welcome'
import SearchPatient from '../../../views/SearchPatient/SearchPatient'
import SavedResearch from '../../../views/SavedResearch/SavedResearch'
import MyProjects from '../../../views/MyProjects/MyProjects'
import Patient from '../../../views/Patient/Patient'
import Scope from '../../../views/Scope/Scope'
import Dashboard from '../../../views/Dashboard/Dashboard'
import CohortCreation from '../../../views/CohortCreation/CohortCreation'
import Contact from '../../../views/Contact/Contact'
import { ODD_CONTACT } from '../../../constants'

const Layout = (props) => {
  return (
    <>
      {props.displaySideBar && <LeftSideBar open={props.name === 'home'} />}

      {props.children}

      <Snackbar anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }} />
    </>
  )
}

const AppNavigation = () => (
  <Router>
    <AutoLogoutContainer />

    <Routes>
      {/* Cohort360 Login Page */}
      <Route
        path="/"
        element={
          <Layout displaySideBar={false}>
            <Login />
          </Layout>
        }
      />
      {/* Cohort360 Health-check Page */}
      <Route
        path="/health-check"
        element={
          <Layout displaySideBar={false}>
            <HealthCheck />
          </Layout>
        }
      />
      <Route path="/" element={<PrivateRoute />}>
        {/* Cohort360: Main Page */}
        <Route
          path="/home"
          element={
            <Layout displaySideBar={true}>
              <Welcome />
            </Layout>
          }
        />
        {/* Cohort360: Research Patient Page */}
        <Route
          path="/patient-search"
          element={
            <Layout displaySideBar={true}>
              <SearchPatient />
            </Layout>
          }
        >
          <Route
            path="/patient-search/:search"
            element={
              <Layout displaySideBar={true}>
                <SearchPatient />
              </Layout>
            }
          />
        </Route>
        {/* Cohort360: Choose Perimeter Page */}
        <Route
          path="/perimeter"
          element={
            <Layout displaySideBar={true}>
              <Scope />
            </Layout>
          }
        />
        {/* Cohort360: Saved Cohorts Page */}
        <Route
          path="/my-cohorts"
          element={
            <Layout displaySideBar={true}>
              <SavedResearch />
            </Layout>
          }
        />
        {/* Cohort360: My Projects + Cohort List Page */}
        <Route
          path="/my-requests"
          element={
            <Layout displaySideBar={true}>
              <MyProjects />
            </Layout>
          }
        />
        {/* Cohort360: Cohorts Creation Page */}
        <Route
          path="/cohort/new"
          element={
            <Layout displaySideBar={true}>
              <CohortCreation />
            </Layout>
          }
        >
          <Route
            path="/cohort/new/:requestId"
            element={
              <Layout displaySideBar={true}>
                <CohortCreation />
              </Layout>
            }
          />
          <Route
            path="/cohort/new/:requestId:snapshotId"
            element={
              <Layout displaySideBar={true}>
                <CohortCreation />
              </Layout>
            }
          />
        </Route>
        {/* Cohort360: Explore Cohort */}
        <Route
          path="/cohort/:cohortId"
          element={
            <Layout displaySideBar={true}>
              <Dashboard context="cohort" />
            </Layout>
          }
        >
          <Route
            path="/cohort/:cohortId/:tabName"
            element={
              <Layout displaySideBar={true}>
                <Dashboard context="cohort" />
              </Layout>
            }
          />
        </Route>
        {/* Cohort360: Explore Perimeter */}
        <Route
          path="/perimeters"
          element={
            <Layout displaySideBar={true}>
              <Dashboard context="perimeters" />
            </Layout>
          }
        >
          <Route
            path="/perimeters/:tabName"
            element={
              <Layout displaySideBar={true}>
                <Dashboard context="perimeters" />
              </Layout>
            }
          />
        </Route>
        {/* Cohort360: All Patients Page */}
        <Route
          path="/my-patients"
          element={
            <Layout displaySideBar={true}>
              <Dashboard context="patients" />
            </Layout>
          }
        >
          <Route
            path="/my-patients/:tabName"
            element={
              <Layout displaySideBar={true}>
                <Dashboard context="patients" />
              </Layout>
            }
          />
        </Route>
        {/* Cohort360: Patient Page */}
        <Route
          path="/patients/:patientId"
          element={
            <Layout displaySideBar={true}>
              <Patient />
            </Layout>
          }
        >
          <Route
            path="/patients/:patientId/:tabName"
            element={
              <Layout displaySideBar={true}>
                <Patient />
              </Layout>
            }
          />
        </Route>
        {/* Cohort360: Contact Page */}
        {!!ODD_CONTACT && (
          <Route
            path="/contact"
            element={
              <Layout displaySideBar={true}>
                <Contact />
              </Layout>
            }
          />
        )}
      </Route>
    </Routes>
  </Router>
)

export default AppNavigation
