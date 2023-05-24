import { createStyles, makeStyles } from 'tss-react/mui'

export default makeStyles((theme) =>
  createStyles({
    documentTable: {
      margin: '0 auto'
    },
    documentButtons: {
      display: 'flex',
      justifyContent: 'flex-end'
    },
    filterAndSort: {
      '& > *': { marginBottom: 5 }
    },
    searchBar: {
      minWidth: 200,
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
      backgroundColor: '#5BC5F2',
      color: '#FFF',
      borderRadius: '25px',
      marginLeft: 8
    }
  })
)
