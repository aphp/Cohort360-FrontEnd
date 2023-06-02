import React from 'react'
import { RouteObject } from 'react-router'

import Login from 'views/Login/Login'
import HealthCheck from 'views/HealthCheck/HealthCheck'
import Welcome from 'views/Welcome/Welcome'
import SearchPatient from 'views/SearchPatient/SearchPatient'
import SavedResearch from 'views/SavedResearch/SavedResearch'
import MyProjects from 'views/MyProjects/MyProjects'
import Patient from 'views/Patient/Patient'
import Scope from 'views/Scope/Scope'
import Dashboard from 'views/Dashboard/Dashboard'
import CohortCreation from 'views/CohortCreation/CohortCreation'
// import Contact from 'views/Contact/Contact'
import PageNotFound from 'views/PageNotFound/PageNotFound'
import NewExplorationCareSite from 'views/Scope/NewExplorationCareSite'

// import { ODD_CONTACT } from '../../../constants'

type configRoute =
  | (RouteObject & {
      exact?: boolean
      displaySideBar?: boolean
      isPrivate?: boolean
      name?: string
    })
  | boolean

const configRoutes: configRoute[] = [
  /**
   * Cohort360 Login Page
   */
  {
    exact: true,
    path: '/',
    name: 'main',
    element: <Login />
  },
  /**
   * Cohort360: Main Page
   */
  {
    exact: true,
    displaySideBar: true,
    path: '/home',
    name: 'home',
    isPrivate: true,
    element: <Welcome />
  },
  {
    exact: true,
    path: '/health-check',
    name: 'health-check',
    element: <HealthCheck />
  },
  /**
   * Cohort360: Research Patient Page
   */
  {
    exact: true,
    displaySideBar: true,
    path: '/patient-search',
    name: 'patient-search',
    isPrivate: true,
    element: <SearchPatient />
  },
  {
    exact: true,
    displaySideBar: true,
    path: '/patient-search/:search',
    name: 'patient-search/:search',
    isPrivate: true,
    element: <SearchPatient />
  },
  /**
   * Cohort360: Choose Perimeter Page
   */
  {
    exact: true,
    displaySideBar: true,
    path: '/perimeter',
    name: 'perimeter',
    isPrivate: true,
    element: <Scope />
  },
  /**
   * Cohort360: Choose Perimeter New Page
   */
  {
    exact: true,
    displaySideBar: true,
    path: '/new-perimeter',
    name: 'new-perimeter',
    isPrivate: true,
    element: <NewExplorationCareSite />
  },
  /**
   * Cohort360: Saved Cohorts Page
   */
  {
    exact: true,
    displaySideBar: true,
    path: '/my-cohorts',
    name: 'my-cohorts',
    isPrivate: true,
    element: <SavedResearch />
  },
  /**
   * Cohort360: My Projects + Cohort List Page
   */
  {
    exact: true,
    displaySideBar: true,
    path: '/my-requests',
    name: 'my-requests',
    isPrivate: true,
    element: <MyProjects />
  },
  /**
   * Cohort360: Cohorts Creation Page
   */
  {
    exact: true,
    displaySideBar: true,
    path: '/cohort/new',
    name: 'cohort/new',
    isPrivate: true,
    element: <CohortCreation />
  },
  {
    exact: true,
    displaySideBar: true,
    path: '/cohort/new/:requestId',
    name: 'cohort/new/:requestId',
    isPrivate: true,
    element: <CohortCreation />
  },
  {
    exact: true,
    displaySideBar: true,
    path: '/cohort/new/:requestId/:snapshotId',
    name: 'cohort/new/:requestId/:snapshotId',
    isPrivate: true,
    element: <CohortCreation />
  },
  /**
   * Cohort360: Explore Cohort
   */
  {
    exact: true,
    displaySideBar: true,
    path: '/cohort/:cohortId/:tabName',
    name: 'cohort/:cohortId/:tabName',
    isPrivate: true,
    element: <Dashboard context={'cohort'} />
  },
  {
    exact: true,
    displaySideBar: true,
    path: '/cohort/:cohortId',
    name: 'cohort/:cohortId',
    isPrivate: true,
    element: <Dashboard context={'cohort'} />
  },
  // /**
  //  * Cohort360: Explore Perimeter
  //  */
  {
    displaySideBar: true,
    path: '/perimeters',
    name: 'perimeters',
    isPrivate: true,
    element: <Dashboard context={'perimeters'} />
  },
  {
    displaySideBar: true,
    path: '/perimeters/:tabName',
    name: 'perimeters/:tabName',
    isPrivate: true,
    element: <Dashboard context={'perimeters'} />
  },
  // /**
  //  * Cohort360: All Patients Page
  //  */
  {
    displaySideBar: true,
    path: '/my-patients',
    name: 'my-patients',
    isPrivate: true,
    element: <Dashboard context={'patients'} />
  },
  {
    displaySideBar: true,
    path: '/my-patients/:tabName',
    name: 'my-patients/:tabName',
    isPrivate: true,
    element: <Dashboard context={'patients'} />
  },
  // /**
  //  * Cohort360: Patient Page
  //  */
  {
    displaySideBar: true,
    path: '/patients/:patientId',
    name: 'patients/:patientId',
    isPrivate: true,
    element: <Patient />
  },
  {
    displaySideBar: true,
    path: '/patients/:patientId/:tabName',
    name: 'patients/:patientId/:tabName',
    isPrivate: true,
    element: <Patient />
  },
  /**
   * Cohort360: 404 - Page Not Found
   */
  {
    path: '*',
    name: 'page-not-found',
    isPrivate: false,
    element: <PageNotFound />
  }
  /**
   * Cohort360: Contact Page
   */
  // !!ODD_CONTACT && {
  //   displaySideBar: true,
  //   path: '/contact',
  //   name: 'contact',
  //   isPrivate: true,
  //   element: <Contact />
  // }
]

export default configRoutes
