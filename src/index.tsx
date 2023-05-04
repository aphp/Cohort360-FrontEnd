import React from 'react'
import ReactDOM from 'react-dom/client'
import { ThemeProvider, StyledEngineProvider } from '@mui/material'

import App from './App'
import theme from 'theme'

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement)

root.render(
  <StyledEngineProvider injectFirst>
    <ThemeProvider theme={theme}>
      <App />
    </ThemeProvider>
  </StyledEngineProvider>
)
