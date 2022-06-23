import { makeStyles, createStyles } from '@mui/styles'

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
    multiple: {
      '&::after': {
        content: "'/'",
        padding: '0 4px'
      },
      '&:last-child::after': {
        content: "''",
        padding: 0
      }
    },
    tableHeadLabel: {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'flex-start',
      padding: 0,
      top: 2,
      position: 'relative'
    },
    tabsContainer: {
      backgroundColor: '#153D8A',
      borderRadius: '8px',
      color: 'white',
      minHeight: 41
    },
    indicator: {
      backgroundColor: '#5BC5F2',
      height: '4px'
    },
    selected: {
      backgroundColor: '#0063AF'
    },
    tabTitle: {
      minWidth: 0,
      color: 'white',
      fontWeight: 400,
      borderBottom: '#255CA1 inset 4px',
      minHeight: 41
    },
    searchBar: {
      minWidth: 250,
      backgroundColor: '#FFF',
      border: '1px solid #D0D7D8',
      boxShadow: '0px 1px 16px #0000000A',
      borderRadius: '25px'
    },
    input: {
      marginLeft: theme.spacing(1),
      flex: 1
    },
    searchButton: {
      minWidth: 150,
      height: 41,
      backgroundColor: '#5BC5F2',
      color: 'white',
      borderRadius: '25px',
      marginInline: 8,
      '&:hover': {
        backgroundColor: '#5BC5F2',
        color: 'white'
      }
    },
    select: {
      marginRight: '4px'
    }
  })
)

export default useStyles
