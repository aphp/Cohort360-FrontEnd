import { makeStyles, createStyles } from '@material-ui/core/styles'

const useStyles = makeStyles(() =>
  createStyles({
    table: {
      minWidth: 650
    },
    tableHead: {
      height: 42,
      backgroundColor: '#D1E2F4',
      textTransform: 'uppercase'
    },
    tableHeadCell: {
      fontSize: 11,
      fontWeight: 'bold',
      color: '#0063AF',
      padding: '0 20px'
    },
    tableBodyRows: {
      '&:nth-of-type(even)': {
        backgroundColor: '#FAF9F9'
      },
      '&:hover': {
        cursor: 'pointer'
      }
    },
    loadingSpinnerContainer: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }
  })
)

export default useStyles
