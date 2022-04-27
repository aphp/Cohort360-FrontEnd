import Login from 'views/Login/Login'
import Welcome from 'views/Welcome/Welcome'
import SearchPatient from 'views/SearchPatient/SearchPatient'
import SavedResearch from 'views/SavedResearch/SavedResearch'
import MyProjects from 'views/MyProjects/MyProjects'
import Patient from 'views/Patient/Patient'
import Scope from 'views/Scope/Scope'
import Dashboard from 'views/Dashboard/Dashboard'
import CohortCreation from 'views/CohortCreation/CohortCreation'
import Contact from 'views/Contact/Contact'

import { ODD_CONTACT } from '../../../constants'

export default [
  /**
   * Cohort360 Login Page
   */
  {
    exact: true,
    path: '/',
    name: 'main',
    component: Login
  },
  /**
   * Cohort360: Main Page
   */
  {
    exact: true,
    displaySideBar: true,
    path: '/accueil',
    name: 'accueil',
    isPrivate: true,
    component: Welcome
  },
  /**
   * Cohort360: Research Patient Page
   */
  {
    exact: true,
    displaySideBar: true,
    path: '/rechercher_patient/:search',
    name: 'rechercher_patient/:search',
    isPrivate: true,
    component: SearchPatient
  },
  {
    exact: true,
    displaySideBar: true,
    path: '/rechercher_patient',
    name: 'rechercher_patient',
    isPrivate: true,
    component: SearchPatient
  },
  /**
   * Cohort360: Choose Perimeter Page
   */
  {
    exact: true,
    displaySideBar: true,
    path: '/perimetre',
    name: 'perimetre',
    isPrivate: true,
    component: Scope
  },
  /**
   * Cohort360: Saved Cohorts Page
   */
  {
    exact: true,
    displaySideBar: true,
    path: '/recherche_sauvegarde',
    name: 'recherche_sauvegarde',
    isPrivate: true,
    component: SavedResearch
  },
  /**
   * Cohort360: My Projects + Cohort List Page
   */
  {
    exact: true,
    displaySideBar: true,
    path: '/mes_projets',
    name: 'mes_projects',
    isPrivate: true,
    component: MyProjects
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
    component: CohortCreation
  },
  {
    exact: true,
    displaySideBar: true,
    path: '/cohort/new/:requestId',
    name: 'cohort/new/:requestId',
    isPrivate: true,
    component: CohortCreation
  },
  {
    exact: true,
    displaySideBar: true,
    path: '/cohort/new/:requestId/:snapshotId',
    name: 'cohort/new/:requestId/:snapshotId',
    isPrivate: true,
    component: CohortCreation
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
    component: Dashboard,
    context: 'cohort'
  },
  {
    exact: true,
    displaySideBar: true,
    path: '/cohort/:cohortId',
    name: 'cohort/:cohortId',
    isPrivate: true,
    component: Dashboard,
    context: 'cohort'
  },
  /**
   * Cohort360: Explore Perimeter
   */
  {
    displaySideBar: true,
    path: '/perimetres/:tabName',
    name: 'perimetres/:tabName',
    isPrivate: true,
    component: Dashboard,
    context: 'perimeters'
  },
  {
    displaySideBar: true,
    path: '/perimetres',
    name: 'perimetres',
    isPrivate: true,
    component: Dashboard,
    context: 'perimeters'
  },
  /**
   * Cohort360: All Patients Page
   */
  {
    displaySideBar: true,
    path: '/mes_patients/:tabName',
    name: 'mes_patients/:tabName',
    isPrivate: true,
    component: Dashboard,
    context: 'patients'
  },
  {
    displaySideBar: true,
    path: '/mes_patients',
    name: 'mes_patients',
    isPrivate: true,
    component: Dashboard,
    context: 'patients'
  },
  /**
   * Cohort360: Patient Page
   */
  {
    displaySideBar: true,
    path: '/patients/:patientId/:tabName',
    name: 'patients/:patientId/:tabName',
    isPrivate: true,
    component: Patient
  },
  {
    displaySideBar: true,
    path: '/patients/:patientId',
    name: 'patients/:patientId',
    isPrivate: true,
    component: Patient
  },
  /**
   * Cohort360: Contact Page
   */
  !!ODD_CONTACT && {
    displaySideBar: true,
    path: '/contact',
    name: 'contact',
    isPrivate: true,
    component: Contact
  }
]
