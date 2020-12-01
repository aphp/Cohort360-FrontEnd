import { makeStyles } from '@material-ui/core/styles'

const useStyles = makeStyles((theme) => ({
  mainContainer: {
    paddingLeft: theme.spacing(3),
    paddingRight: theme.spacing(3)
  },
  subContainer: {
    flex: 1,
    height: 'calc(95vh - 136px)',
    display: 'flex',
    flexDirection: 'column'
  },
  header: {
    backgroundColor: '#EBECED',
    display: 'flex',
    alignItems: 'center',
    padding: theme.spacing(2),
    justifyContent: 'center',
    color: '#818291',
    minHeight: '60px'
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center'
  },
  content: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#707070',
    overflowY: 'auto'
  },
  iconButtonRoot: {
    backgroundColor: '#0277FF',
    padding: '2px',
    color: 'white'
  },
  buttonLink: {
    margin: theme.spacing(2),
    fontWeight: 'bold',
    color: '#707070'
  },
  textLink: {
    color: '#707070',
    marginLeft: theme.spacing(1),
    marginRight: theme.spacing(1)
  },
  modalContainer: {
    padding: theme.spacing(3),
    height: 'calc(100% - 128px)'
  },
  patientListRoot: {
    flex: 1,
    width: '100%',
    overflowY: 'auto'
  },
  cohortPatientListItem: {
    backgroundColor: '#C0C0C020'
  },
  svgIcon: {
    fill: '#ED6D91'
  },
  aliveChip: {
    backgroundColor: '#E1FAED',
    color: '#707D76'
  },
  deceasedChip: {
    backgroundColor: '#FFE3E7',
    color: '#9F8D90'
  },
  patientListHeaderContainer: {
    backgroundColor: '#F5F6FA',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  patientListHeaderLabel: {
    fontWeight: 'bold'
  },
  footerButtonContainer: {
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    padding: theme.spacing(2)
  },
  saveButton: {
    float: 'right',
    margin: theme.spacing(0, 1)
  },
  loadingSpinner: {
    position: 'absolute',
    top: '50%',
    right: '50%'
  }
}))

export default useStyles
