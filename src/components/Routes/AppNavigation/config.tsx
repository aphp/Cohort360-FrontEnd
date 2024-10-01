import React from 'react'
import { RouteObject } from 'react-router'

import Login from 'views/Login/Login'
import HealthCheck from 'views/HealthCheck/HealthCheck'
import Welcome from 'views/Welcome/Welcome'
import SearchPatient from 'views/SearchPatient'
import Patient from 'views/Patient'
import Dashboard from 'views/Dashboard'
import CohortCreation from 'views/CohortCreation/CohortCreation'
import PageNotFound from 'views/PageNotFound/PageNotFound'
import CareSiteView from 'views/Scope/CareSiteView'
import MyCohorts from 'views/MyCohorts'
import MyRequests from 'views/MyRequests'
import DownloadPopup from 'views/DownloadPopup/DownloadPopup'
import Export from 'pages/Export'
import ExportRequest from 'pages/ExportRequest'
import { URLS } from 'types/exploration'

// import { ODD_CONTACT } from '../../../constants'

type configRoute = RouteObject & {
  exact: boolean
  displaySideBar: boolean
  isPrivate: boolean
  name: string
}

const configRoutes: configRoute[] = [
  /**
   * Cohort360 Login Page
   */
  {
    exact: true,
    path: '/',
    name: 'main',
    element: <Login />,
    isPrivate: false,
    displaySideBar: false
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
    element: <HealthCheck />,
    isPrivate: false,
    displaySideBar: false
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
    element: <CareSiteView />
  },
  /**
   * Cohort360: Saved Cohorts Page
   */
  {
    exact: true,
    displaySideBar: true,
    path: '/my-cohorts/favorites',
    name: 'my-cohorts/favorites',
    isPrivate: true,
    element: <MyCohorts favoriteUrl />
  },
  {
    exact: true,
    displaySideBar: true,
    path: '/my-cohorts',
    name: 'my-cohorts',
    isPrivate: true,
    element: <MyCohorts />
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
    element: <MyRequests />
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
    path: `/${URLS.COHORT}/:tabName`,
    name: 'cohort/:tabName',
    isPrivate: true,
    element: <Dashboard context={URLS.COHORT} />
  },
  {
    exact: true,
    displaySideBar: true,
    path: `/${URLS.COHORT}`,
    name: 'cohort',
    isPrivate: true,
    element: <Dashboard context={URLS.COHORT} />
  },
  // /**
  //  * Cohort360: Explore Perimeter
  //  */
  {
    displaySideBar: true,
    path: `/${URLS.PERIMETERS}`,
    name: 'perimeters',
    isPrivate: true,
    element: <Dashboard context={URLS.PERIMETERS} />,
    exact: false
  },
  {
    displaySideBar: true,
    path: `/${URLS.PERIMETERS}/:tabName`,
    name: 'perimeters/:tabName',
    isPrivate: true,
    element: <Dashboard context={URLS.PERIMETERS} />,
    exact: false
  },
  // /**
  //  * Cohort360: All Patients Page
  //  */
  {
    displaySideBar: true,
    path: `/${URLS.PATIENTS}`,
    name: 'my-patients',
    isPrivate: true,
    element: <Dashboard context={URLS.PATIENTS} />,
    exact: false
  },
  {
    displaySideBar: true,
    path: `/${URLS.PATIENTS}/:tabName`,
    name: 'my-patients/:tabName',
    isPrivate: true,
    element: <Dashboard context={URLS.PATIENTS} />,
    exact: false
  },
  // /**
  //  * Cohort360: Patient Page
  //  */
  {
    displaySideBar: true,
    path: '/patients/:patientId',
    name: 'patients/:patientId',
    isPrivate: true,
    element: <Patient />,
    exact: false
  },
  {
    displaySideBar: true,
    path: '/patients/:patientId/:tabName',
    name: 'patients/:patientId/:tabName',
    isPrivate: true,
    element: <Patient />,
    exact: false
  },

  /**
   * Cohort360: Export Page
   */
  {
    path: '/exports',
    name: '/exports',
    isPrivate: true,
    element: <Export />,
    exact: true,
    displaySideBar: true
  },
  {
    path: '/exports/new',
    name: '/exports/new',
    isPrivate: true,
    element: <ExportRequest />,
    exact: true,
    displaySideBar: true
  },

  /**
   * Cohort360: Feasibility Reports Page
   */
  // {
  //   path: '/feasibility-reports',
  //   name: '/feasibility-reports',
  //   isPrivate: true,
  //   element: <FeasibilityReports />,
  //   exact: true,
  //   displaySideBar: true
  // },

  /**
   * Cohort360: Export download Page
   */
  {
    path: '/download/:resource/:itemId',
    name: '/download/:resource/:itemId',
    isPrivate: true,
    element: <DownloadPopup />,
    exact: false,
    displaySideBar: false
  },
  /**
   * Cohort360: 404 - Page Not Found
   */
  {
    path: '*',
    name: 'page-not-found',
    isPrivate: false,
    element: <PageNotFound />,
    displaySideBar: false,
    exact: false
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
