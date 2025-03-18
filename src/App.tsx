import React from 'react'
import CssBaseline from '@mui/material/CssBaseline'
import { Provider } from 'react-redux'
import { PersistGate } from 'redux-persist/es/integration/react'
import MomentUtils from '@date-io/moment'
import moment from 'moment'

import { LocalizationProvider } from '@mui/x-date-pickers'

import AppNavigation from './components/Routes/AppNavigation/AppNavigation'
import WarningDialog from 'components/ui/WarningDialog'

import { store, persistor } from './state/store'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

import 'moment/dist/locale/fr'

moment.locale('fr')

const queryClient = new QueryClient()

const App = () => (
  <LocalizationProvider dateAdapter={MomentUtils}>
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <WarningDialog />
        <PersistGate loading={null} persistor={persistor}>
          <CssBaseline />

          <AppNavigation />
        </PersistGate>
      </QueryClientProvider>
    </Provider>
  </LocalizationProvider>
)

export default App
