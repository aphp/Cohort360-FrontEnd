import React from 'react'
import CssBaseline from '@material-ui/core/CssBaseline'
import { ApolloProvider } from '@apollo/react-hooks'
import { ApolloClient, InMemoryCache } from '@apollo/client'
import { Provider } from 'react-redux'
import { PersistGate } from 'redux-persist/es/integration/react'
import MomentUtils from '@date-io/moment'
import moment from 'moment'

import { MuiPickersUtilsProvider } from '@material-ui/pickers'

import AppNavigation from './components/Routes/AppNavigation/AppNavigation'

import { store, persistor } from './state/store'

import { AUTH_API_URL } from './constants'

import 'moment/locale/fr'

const authClient = new ApolloClient({
  cache: new InMemoryCache(),
  uri: AUTH_API_URL
})

moment.locale('fr')

const App = () => (
  <MuiPickersUtilsProvider utils={MomentUtils}>
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <ApolloProvider client={authClient}>
          <CssBaseline />

          <AppNavigation />
        </ApolloProvider>
      </PersistGate>
    </Provider>
  </MuiPickersUtilsProvider>
)

export default App
