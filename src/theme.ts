import { createTheme } from '@mui/material'

import { aphp, eds } from 'styles/palette'

export default createTheme({
  palette: {
    common: {
      black: eds.blue[600]
    },
    primary: {
      main: aphp.bleu[600]
    },
    secondary: {
      main: '#ED6D91'
    },
    action: {
      active: '#5BC5F2'
    },
    text: {
      primary: eds.blue[600]
    },
    background: {
      default: '#fff'
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
  },
  components: {
    MuiDialogTitle: {
      styleOverrides: {
        root: {
          fontSize: '18px',
          fontFamily: "'Montserrat', sans-serif",
          color: aphp.bleu[600],
          textTransform: 'none',
          lineHeight: 2
        }
      }
    }
  }
})
