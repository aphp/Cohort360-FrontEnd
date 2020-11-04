import React from 'react'
import { BrowserRouter, Route, Switch } from 'react-router-dom'
import CssBaseline from '@material-ui/core/CssBaseline'
import { ApolloProvider } from '@apollo/react-hooks'
import ApolloClient from 'apollo-boost'

import { PersistGate } from 'redux-persist/integration/react'

import Connexion from './views/Connexion/Connexion'
import Accueil from './views/Accueil/Accueil'
import RechercherPatient from './views/RechercherPatient/RechercherPatient'
import RechercheSauvegarde from './views/RechercheSauvegarde/RechercheSauvegarde'
import Patient from './views/Patient/Patient'
import Scope from './views/Scope/Scope'
import Perimetre from './views/Perimetre/Perimetre'
import Cohort from './views/Cohort/Cohort'
import MyPatients from './views/MyPatients/MyPatients'
import PrivateRoute from './components/Routes/Private'
import LeftSideBar from './components/LeftSideBar/LeftSideBar'
import AutoLogoutContainer from './components/Routes/AutoLogoutContainer'

import { Provider } from 'react-redux'
import { store, persistor } from './state/store'
import { AUTH_API_URL } from './constants'

const authClient = new ApolloClient({
  uri: AUTH_API_URL
})

const App = () => (
  <Provider store={store}>
    <PersistGate loading={null} persistor={persistor}>
      <ApolloProvider client={authClient}>
        <BrowserRouter>
          <CssBaseline />
          <Route path="/accueil">
            <LeftSideBar initialState={true} />
            <AutoLogoutContainer />
          </Route>
          <Route path="/perimetre">
            <LeftSideBar />
            <AutoLogoutContainer />
          </Route>
          <Route path="/perimetres">
            <LeftSideBar />
            <AutoLogoutContainer />
          </Route>
          <Route path="/rechercher_patient">
            <LeftSideBar />
            <AutoLogoutContainer />
          </Route>
          <Route path="/recherche_sauvegarde">
            <LeftSideBar />
            <AutoLogoutContainer />
          </Route>
          <Route path="/patients">
            <LeftSideBar />
            <AutoLogoutContainer />
          </Route>
          <Route path="/mes_patients">
            <LeftSideBar />
            <AutoLogoutContainer />
          </Route>
          <Route path="/cohort">
            <LeftSideBar />
            <AutoLogoutContainer />
          </Route>
          <Switch>
            {/* <Route path="/*" component={() => "404 not found"} /> */}
            <Route exact path="/" component={Connexion} />
            <PrivateRoute exact path="/accueil" component={Accueil} />
            <PrivateRoute exact path="/perimetre" component={Scope} />
            <PrivateRoute
              exact
              path="/rechercher_patient"
              component={RechercherPatient}
            />
            <PrivateRoute
              exact
              path="/mes_patients/:tabName"
              component={MyPatients}
            />
            <PrivateRoute exact path="/mes_patients" component={MyPatients} />
            <PrivateRoute
              exact
              path="/recherche_sauvegarde"
              component={RechercheSauvegarde}
            />
            <PrivateRoute
              path="/cohort/:cohortId/:tabName"
              component={Cohort}
            />
            <PrivateRoute path="/cohort/:cohortId" component={Cohort} />
            <PrivateRoute path="/perimetres/:tabName" component={Perimetre} />
            <PrivateRoute path="/perimetres" component={Perimetre} />
            <PrivateRoute
              path="/patients/:patientId/:tabName"
              component={Patient}
            />
            <PrivateRoute path="/patients/:patientId" component={Patient} />
          </Switch>
        </BrowserRouter>
      </ApolloProvider>
    </PersistGate>
  </Provider>
)

export default App
