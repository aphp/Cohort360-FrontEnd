import { makeStyles } from 'tss-react/mui'
import { Theme } from '@mui/material/styles'

const useStyles = makeStyles()((theme: Theme) => ({
  searchbarWrapper: {
    marginBlock: 8
  },
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
    height: 25,
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
    fontSize: 11,
    backgroundColor: '#5BC5F2',
    color: '#FFF',
    fontWeight: 'bold'
  },
  cancelledChip: {
    fontSize: 11,
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
    height: 80,
    '&:nth-of-type(even)': {
      backgroundColor: '#FAF9F9'
    }
  },
  iconSize: {
    fontSize: 30
  },
  searchIcon: {
    padding: 0,
    marginLeft: 4
  },
  iconMargin: {
    margin: `0 ${theme.spacing(1)}`
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
    borderRadius: 8,
    color: 'white',
    minHeight: 41,
    '& .Mui-selected': { color: 'white' }
  },
  indicator: {
    backgroundColor: '#ED6D91',
    height: '4px'
  },
  selected: {
    backgroundColor: '#0063AF',
    color: 'white !important'
  },
  tabTitle: {
    minWidth: 160,
    color: 'white',
    fontWeight: 400,
    borderBottom: '#255CA1 inset 4px',
    minHeight: 41,
    padding: '6px 12px'
  },
  searchBar: {
    minWidth: 250,
    backgroundColor: '#FFF',
    border: '1px solid #D0D7D8',
    boxShadow: '0px 1px 16px #0000000A',
    borderRadius: 25
  },
  input: {
    marginLeft: theme.spacing(1),
    flex: 1
  },
  searchButton: {
    minWidth: 150,
    height: 32,
    backgroundColor: '#5BC5F2',
    color: 'white',
    borderRadius: 25,
    marginInline: 8,
    '&:hover': {
      backgroundColor: '#5BC5F2',
      color: 'white'
    }
  },
  errorContainer: {
    color: '#f44336',
    width: '100%',
    padding: '0 16px'
  },
  select: {
    marginRight: 4,
    borderRadius: 25,
    backgroundColor: '#FFF',
    '& .MuiSelect-select': {
      borderRadius: 25
    }
  }
}))

export default useStyles
