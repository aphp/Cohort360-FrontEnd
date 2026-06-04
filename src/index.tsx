import React from 'react'
import ReactDOM from 'react-dom/client'
import { ThemeProvider, StyledEngineProvider } from '@mui/material'

import App from './App'
import theme from 'theme'
import { initConfig } from 'config'
import './polyfills'

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement)

await initConfig(root, () => (
  <StyledEngineProvider injectFirst>
    <ThemeProvider theme={theme}>
      <App />
    </ThemeProvider>
  </StyledEngineProvider>
))
