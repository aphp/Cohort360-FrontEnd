import React from 'react'
import CssBaseline from '@mui/material/CssBaseline'
import { Provider } from 'react-redux'
import { PersistGate } from 'redux-persist/es/integration/react'
import { AdapterMoment } from '@mui/x-date-pickers/AdapterMoment'
import moment from 'moment'

import { LocalizationProvider } from '@mui/x-date-pickers'

import AppNavigation from './components/Routes/AppNavigation/AppNavigation'
import WarningDialog from 'components/ui/WarningDialog'

import { store, persistor } from './state/store'

import 'moment/dist/locale/fr'

moment.locale('fr')

const App = () => (
  <LocalizationProvider dateAdapter={AdapterMoment}>
    <Provider store={store}>
      <WarningDialog />
      <PersistGate loading={null} persistor={persistor}>
        <CssBaseline />

        <AppNavigation />
      </PersistGate>
    </Provider>
  </LocalizationProvider>
)

export default App
