import { makeStyles, createStyles } from '@material-ui/core/styles'

const useStyles = makeStyles(() =>
  createStyles({
    rightPanelContainerStyle: {
      position: 'fixed',
      width: 284,
      height: 'calc(100% - 16px)',
      top: 0,
      right: 0,
      margin: 8
    },
    container: {
      borderRadius: 12,
      border: '1px solid #CCCCCD',
      backgroundColor: 'white',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      marginTop: 8,
      padding: 4,
      '&:first-child': {
        marginTop: 0
      }
    },
    requestExecution: {
      marginTop: 12,
      marginBottom: 12,
      backgroundColor: '#5BC5F2',
      borderRadius: '26px',
      border: 'none',
      height: '42px',
      width: '90%',
      color: '#FFF',
      '&:hover': {
        backgroundColor: '#499cbf'
      },
      '&:disabled': {
        opacity: 0.7
      }
    },
    actionButton: {
      backgroundColor: '#FFF',
      marginBottom: 6,
      borderRadius: '18px',
      height: '36px',
      width: '80%',
      border: `2px solid currentColor`,
      '&:disabled': {
        color: '#ccc',
        opacity: 0.7
      },
      '& > span': {
        position: 'relative'
      }
    },
    boldText: {
      fontWeight: 700
    },
    blueText: {
      color: '#5BC5F2'
    },
    redText: {
      color: '#fc1847'
    },
    iconBorder: {
      color: 'currentColor',
      position: 'absolute',
      top: 0,
      left: 10
    },
    patientTypo: {
      margin: '10px'
    },
    sidesMargin: {
      margin: '0 10px'
    },
    accordion: {
      background: 'transparent',
      marginTop: '12px !important',
      color: 'currentColor !important',
      '&::before': {
        content: 'none'
      }
    }
  })
)

export default useStyles
