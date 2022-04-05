import { makeStyles, createStyles } from '@material-ui/core/styles'

const useStyles = makeStyles((theme) =>
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
    libelle: {
      fontWeight: 'bold'
    },
    genderIcon: {
      height: '25px',
      fill: '#0063AF'
    },
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
    },
    validChip: {
      fontSize: '11px',
      backgroundColor: '#5BC5F2',
      color: '#FFF',
      fontWeight: 'bold'
    },
    cancelledChip: {
      fontSize: '11px',
      backgroundColor: '#D0D7D8',
      color: '#FFF',
      fontWeight: 'bold'
    },
    emptyTableRow: {
      minHeight: `calc(100vh - 500px)`,
      height: `calc(100vh - 500px)`,
      maxHeight: `calc(100vh - 500px)`
    },
    tableBodyRows: {
      height: '80px',
      '&:nth-of-type(even)': {
        backgroundColor: '#FAF9F9'
      }
    },
    iconSize: {
      fontSize: '30px'
    },
    searchIcon: {
      padding: 0,
      marginLeft: 4
    },
    iconMargin: {
      margin: `0 ${theme.spacing(1)}px`
    },
    watermark: {
      top: 0,
      bottom: 0,
      left: 0,
      right: 0,
      margin: 'auto',
      width: 'fit-content',
      height: 'fit-content',
      color: '#0003',
      position: 'absolute',
      fontSize: '2vw',
      transform: 'rotate(-35deg)'
    }
  })
)

export default useStyles
