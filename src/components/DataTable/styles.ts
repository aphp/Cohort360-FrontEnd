import { makeStyles } from 'tss-react/mui'
import { Theme } from '@mui/material/styles'

const useStyles = makeStyles()((theme: Theme) => ({
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
  }
}))

export default useStyles
