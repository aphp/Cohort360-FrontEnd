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
  }
})
