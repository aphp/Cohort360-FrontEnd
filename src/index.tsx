import React from 'react'
import ReactDOM from 'react-dom/client'
import { createTheme, ThemeProvider, Theme, StyledEngineProvider } from '@mui/material/styles'
import App from './App'

declare module '@mui/styles/defaultTheme' {
  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  interface DefaultTheme extends Theme {}
}

const theme = createTheme({
  palette: {
    common: {
      black: '#153D8A'
    },
    primary: {
      main: '#0063AF'
    },
    secondary: {
      main: '#ED6D91'
    },
    action: {
      active: '#5BC5F2'
    },
    text: {
      primary: '#153D8A'
    },
    background: {
      default: '#E6F1FD'
    }
  },
  typography: {
    fontFamily: "'Open Sans', sans-serif",
    h1: {
      fontFamily: "'Montserrat', sans-serif",
      fontSize: '32px',
      fontWeight: 'bold'
    },
    h2: {
      fontFamily: "'Montserrat', sans-serif",
      fontSize: '18px',
      fontWeight: 'bold'
    },
    h3: {
      fontFamily: "'Montserrat', sans-serif",
      fontSize: '13px',
      fontWeight: 'bold'
    },
    h4: {
      fontSize: '32px',
      fontWeight: 'bold'
    },
    h5: {
      fontSize: '16px',
      fontWeight: 'bold'
    },
    h6: {
      fontSize: '11px',
      fontWeight: 'bold',
      textTransform: 'uppercase',
      lineHeight: '2.66'
    },
    body1: {
      fontSize: '13px'
    },
    body2: {
      fontSize: '14px'
    },
    button: {
      fontFamily: "'Open Sans', sans-serif",
      fontWeight: 'bold',
      fontSize: '15px',
      textTransform: 'none'
    }
  }
})

const root = ReactDOM.createRoot(document.getElementById('root'))

root.render(
  <StyledEngineProvider injectFirst>
    <ThemeProvider theme={theme}>
      <App />
    </ThemeProvider>
  </StyledEngineProvider>
)
