import { makeStyles, createStyles } from '@material-ui/core/styles'

const useStyles = makeStyles(() =>
  createStyles({
    rightPanelContainerStyle: {
      position: 'fixed',
      width: 220,
      height: 'calc(100% - 72px)',
      bottom: '0px',
      right: '0px',
      border: '1px solid #CCCCCD',
      backgroundColor: 'white',
      display: 'flex',
      flexDirection: 'column'
    },
    requestAction: {
      margin: '20px 0px'
    },
    requestExecution: {
      backgroundColor: '#5BC5F2',
      borderRadius: '26px',
      border: 'none',
      height: '40px',
      color: '#FFF',
      '&:hover': {
        backgroundColor: '#499cbf'
      }
    },
    boldText: {
      fontWeight: 700
    },
    blueText: {
      color: '#5BC5F2'
    },
    iconBorder: {
      marginRight: '10px'
    },
    patientTypo: {
      margin: '10px'
    },
    sidesMargin: {
      margin: '0 10px'
    }
  })
)

export default useStyles
