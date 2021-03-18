import React from 'react'
import { BrowserRouter, Route, Switch } from 'react-router-dom'
import CssBaseline from '@material-ui/core/CssBaseline'
import { ApolloProvider } from '@apollo/react-hooks'
import { enableMapSet } from 'immer'
import ApolloClient from 'apollo-boost'

import { MuiPickersUtilsProvider } from '@material-ui/pickers'
import MomentUtils from '@date-io/moment'
import moment from 'moment'

import Connexion from './views/Connexion/Connexion'
import FakeConnexion from './views/Connexion/FakeConnexion'
import ArkhnConnexion from './views/Connexion/ArkhnConnexion'
import Accueil from './views/Accueil/Accueil'
import RechercherPatient from './views/RechercherPatient/RechercherPatient'
import RechercheSauvegarde from './views/RechercheSauvegarde/RechercheSauvegarde'
import Patient from './views/Patient/Patient'
import Scope from './views/Scope/Scope'
import Dashboard from './views/Dashboard/Dashboard'
// import Perimetre from './views/Perimetre/Perimetre'
// import Cohort from './views/Cohort/Cohort'
// import MyPatients from './views/MyPatients/MyPatients'
import PrivateRoute from './components/Routes/Private'
import LeftSideBar from './components/LeftSideBar/LeftSideBar'
import CohortCreation from './views/CohortCreation/CohortCreation'

import { Provider } from 'react-redux'
import { store } from './state/store'
import { AUTH_API_URL, CONTEXT } from './constants'

import 'moment/locale/fr'

const authClient = new ApolloClient({
  uri: AUTH_API_URL
})

enableMapSet()
moment.locale('fr')

const App = () => (
  <MuiPickersUtilsProvider utils={MomentUtils}>
    <Provider store={store}>
      <ApolloProvider client={authClient}>
        <BrowserRouter>
          <CssBaseline />
          <Switch>
            {/* <Route path="/*" render={() => '404 not found'} /> */}
            {/* TODO: Change connexion to /login */}
            <Route
              exact
              path="/"
              component={CONTEXT === 'arkhn' ? ArkhnConnexion : CONTEXT === 'aphp' ? Connexion : FakeConnexion}
            />
            {/* TODO: Change home to / */}
            <PrivateRoute
              exact
              path="/accueil"
              render={() => (
                <>
                  <LeftSideBar open={true} />
                  <Accueil />
                </>
              )}
            />
            <PrivateRoute
              exact
              path="/perimetre"
              render={() => (
                <>
                  <LeftSideBar />
                  <Scope />
                </>
              )}
            />
            <PrivateRoute
              exact
              path="/rechercher_patient"
              render={() => (
                <>
                  <LeftSideBar />
                  <RechercherPatient />
                </>
              )}
            />
            <PrivateRoute
              exact
              path="/rechercher_patient/:search"
              render={() => (
                <React.Fragment>
                  <LeftSideBar />
                  <RechercherPatient />
                </React.Fragment>
              )}
            />
            <PrivateRoute
              exact
              path="/mes_patients/:tabName"
              render={() => (
                <>
                  <LeftSideBar />
                  <Dashboard context="patients" />
                </>
              )}
            />
            <PrivateRoute
              exact
              path="/mes_patients"
              render={() => (
                <>
                  <LeftSideBar />
                  <Dashboard context="patients" />
                </>
              )}
            />
            <PrivateRoute
              exact
              path="/recherche_sauvegarde"
              render={() => (
                <>
                  <LeftSideBar />
                  <RechercheSauvegarde />
                </>
              )}
            />
            <PrivateRoute
              path="/cohort/new/:tabName"
              render={() => (
                <>
                  <LeftSideBar />
                  <CohortCreation />
                </>
              )}
            />
            <PrivateRoute
              path="/cohort/new"
              render={() => (
                <>
                  <LeftSideBar />
                  <CohortCreation />
                </>
              )}
            />
            <PrivateRoute
              path="/cohort/:cohortId/:tabName"
              render={() => (
                <>
                  <LeftSideBar />
                  <Dashboard context="cohort" />
                </>
              )}
            />
            <PrivateRoute
              path="/cohort/:cohortId"
              render={() => (
                <>
                  <LeftSideBar />
                  <Dashboard context="cohort" />
                </>
              )}
            />
            <PrivateRoute
              path="/perimetres/:tabName"
              render={() => (
                <>
                  <LeftSideBar />
                  <Dashboard context="perimeters" />
                </>
              )}
            />
            <PrivateRoute
              path="/perimetres"
              render={() => (
                <>
                  <LeftSideBar />
                  <Dashboard context="perimeters" />
                </>
              )}
            />
            <PrivateRoute
              path="/patients/:patientId/:tabName"
              render={() => (
                <>
                  <LeftSideBar />
                  <Patient />
                </>
              )}
            />
            <PrivateRoute
              path="/patients/:patientId"
              render={() => (
                <>
                  <LeftSideBar />
                  <Patient />
                </>
              )}
            />
            <PrivateRoute
              exact
              render={() => (
                <>
                  <LeftSideBar open={true} />
                  <Accueil />
                </>
              )}
            />
          </Switch>
        </BrowserRouter>
      </ApolloProvider>
    </Provider>
  </MuiPickersUtilsProvider>
)

export default App
