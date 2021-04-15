import Connexion from 'views/Connexion/Connexion'
import FakeConnexion from 'views/Connexion/FakeConnexion'
import ArkhnConnexion from 'views/Connexion/ArkhnConnexion'
import Accueil from 'views/Accueil/Accueil'
import RechercherPatient from 'views/RechercherPatient/RechercherPatient'
import RechercheSauvegarde from 'views/RechercheSauvegarde/RechercheSauvegarde'
import Patient from 'views/Patient/Patient'
import Scope from 'views/Scope/Scope'
import Dashboard from 'views/Dashboard/Dashboard'
import CohortCreation from 'views/CohortCreation/CohortCreation'

import { CONTEXT } from '../../../constants'

export default [
  /**
   * Cohort360 Connexion Page
   */
  {
    exact: true,
    path: '/',
    route: 'main',
    component: CONTEXT === 'arkhn' ? ArkhnConnexion : CONTEXT === 'aphp' ? Connexion : FakeConnexion
  },
  /**
   * Chohort360: Main Page
   */
  {
    exact: true,
    displaySideBar: true,
    path: '/accueil',
    route: 'accueil',
    component: Accueil
  },
  /**
   * Chohort360: Research Patient Page
   */
  {
    exact: true,
    displaySideBar: true,
    path: '/rechercher_patient/:search',
    name: 'rechercher_patient/:search',
    component: RechercherPatient
  },
  /**
   * Chohort360: Choose Perimeter Page
   */
  {
    exact: true,
    displaySideBar: true,
    path: '/perimetre',
    route: 'perimetre',
    component: Scope
  },
  /**
   * Chohort360: Saved Cohorts Page
   */
  {
    exact: true,
    displaySideBar: true,
    path: '/recherche_sauvegarde',
    name: 'recherche_sauvegarde',
    component: RechercheSauvegarde
  },
  /**
   * Chohort360: Creation Page
   */
  {
    exact: true,
    displaySideBar: true,
    path: '/cohort/new',
    name: 'cohort/new',
    component: CohortCreation
  },
  /**
   * Chohort360: Explore Cohort
   */
  {
    exact: true,
    displaySideBar: true,
    path: '/cohort/:cohortId/:tabName',
    name: 'cohort/:cohortId/:tabName',
    component: Dashboard,
    context: 'cohort'
  },
  {
    exact: true,
    displaySideBar: true,
    path: '/cohort/:cohortId',
    name: 'cohort/:cohortId',
    component: Dashboard,
    context: 'cohort'
  },
  /**
   * Chohort360: Explore Perimeter
   */
  {
    displaySideBar: true,
    path: '/perimetres/:tabName',
    name: 'perimetres/:tabName',
    component: Dashboard,
    context: 'perimeters'
  },
  {
    displaySideBar: true,
    path: '/perimetres',
    name: 'perimetres',
    component: Dashboard,
    context: 'perimeters'
  },
  /**
   * Chohort360: All Patients Page
   */
  {
    displaySideBar: true,
    path: '/mes_patients/:tabName',
    name: 'mes_patients/:tabName',
    component: Dashboard,
    context: 'patients'
  },
  {
    displaySideBar: true,
    path: '/mes_patients',
    name: 'mes_patients',
    component: Dashboard,
    context: 'patients'
  },
  /**
   * Chohort360: Patient Page
   */
  {
    displaySideBar: true,
    path: '/patients/:patientId/:tabName',
    name: 'patients/:patientId/:tabName',
    component: Patient
  },
  {
    displaySideBar: true,
    path: '/patients/:patientId',
    name: 'patients/:patientId',
    component: Patient
  }
]
