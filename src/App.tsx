import React from 'react'
import CssBaseline from '@material-ui/core/CssBaseline'
import { ApolloProvider } from '@apollo/react-hooks'
import { ApolloClient, InMemoryCache } from '@apollo/client'
import { enableMapSet } from 'immer'
import { Provider } from 'react-redux'
import MomentUtils from '@date-io/moment'
import moment from 'moment'

import { MuiPickersUtilsProvider } from '@material-ui/pickers'

import AppNavigation from 'components/Routes/AppNavigation/AppNavigation'

import { store } from './state/store'

import { AUTH_API_URL } from './constants'

import 'moment/locale/fr'

const authClient = new ApolloClient({
  cache: new InMemoryCache(),
  uri: AUTH_API_URL
})

enableMapSet()
moment.locale('fr')

const App = () => (
  <MuiPickersUtilsProvider utils={MomentUtils}>
    <Provider store={store}>
      <ApolloProvider client={authClient}>
        <CssBaseline />

        <AppNavigation />
      </ApolloProvider>
    </Provider>
  </MuiPickersUtilsProvider>
)

export default App
