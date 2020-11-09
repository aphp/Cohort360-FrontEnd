import { makeStyles, createStyles } from '@material-ui/core/styles'

const useStyles = makeStyles(() =>
  createStyles({
    table: {
      minWidth: '650'
    },
    tableHead: {
      height: '42px',
      backgroundColor: '#D1E2F4',
      textTransform: 'uppercase'
    },
    tableHeadCell: {
      fontSize: '11px',
      fontWeight: 'bold',
      color: '#0063AF',
      padding: '0 20px'
    },
    tableBodyRows: {
      height: '80px',
      '&:nth-of-type(even)': {
        backgroundColor: '#FAF9F9'
      },
      '&:hover': {
        cursor: 'pointer'
      }
    },
    genderIcon: {
      height: '25px',
      fill: '#0063AF'
    },
    vitalStatusTag: {
      backgroundColor: '#5BC5F2',
      color: '#fff',
      fontSize: '11px',
      fontWeight: 'bold'
    },
    link: {
      color: '#5BC5F2',
      fontSize: '13px',
      fontWeight: '600',
      cursor: 'pointer'
    },
    aliveChip: {
      fontSize: '11px',
      backgroundColor: '#5BC5F2',
      width: 75,
      color: '#FFF',
      fontWeight: 'bold'
    },
    deceasedChip: {
      fontSize: '11px',
      backgroundColor: '#D0D7D8',
      width: 75,
      color: '#FFF',
      fontWeight: 'bold'
    },
    loadingSpinner: {
      position: 'absolute',
      top: '50%',
      right: '50%'
    },
    tableContainer: {},
    pagination: {
      margin: '10px 0',
      float: 'right',
      '& button': {
        backgroundColor: '#fff',
        color: '#5BC5F2'
      },
      '& .MuiPaginationItem-page.Mui-selected': {
        color: '#0063AF',
        backgroundColor: '#FFF'
      }
    }
  })
)

export default useStyles
