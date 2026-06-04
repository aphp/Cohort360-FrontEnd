import { makeStyles } from 'tss-react/mui'

const useStyles = makeStyles()(() => ({
  rightPanelContainerStyle: {
    position: 'fixed',
    width: 284,
    height: 'calc(100% - 16px)',
    top: 0,
    right: 0,
    margin: 8,
    overflow: 'auto'
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
    '&:first-of-type': {
      marginTop: 0
    }
  },
  requestExecution: {
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
  iconBorder: {
    color: 'currentColor'
  },
  patientTypo: {
    margin: '10px'
  },
  sidesMargin: {
    margin: '0 10px'
  },
  errorAlert: {
    marginTop: 8,
    borderRadius: 12,
    border: '1px solid currentColor'
  }
}))

export default useStyles
