import { makeStyles } from '@material-ui/core/styles'

export default makeStyles({
  paper: {
    width: (props) => props.width
  },
  patientList: {
    overflowY: 'auto'
  },
  pagination: {
    float: 'right',
    '& button': {
      backgroundColor: '#fff',
      color: '#5BC5F2'
    },
    '& .MuiPaginationItem-page.Mui-selected': {
      color: '#0063AF',
      backgroundColor: '#FFF'
    }
  },
  loading: {
    margin: '16px 0'
  },
  openLeftBar: {
    backgroundColor: '#FFF',
    width: 30,
    height: 101,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    boxShadow: '0px 3px 6px #0000000A',
    borderRadius: '2px 0px 0px 2px',
    position: 'fixed',
    marginLeft: -31
  }
})
