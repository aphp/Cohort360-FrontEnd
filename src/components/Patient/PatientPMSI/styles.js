import { createStyles, makeStyles } from 'tss-react/mui'

export default makeStyles((theme) =>
  createStyles({
    documentTable: {
      margin: '0 auto'
    },
    filterAndSort: {
      '& > *': { marginBottom: 5 }
    },
    root: {
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
      fontWeight: '400',
      borderBottom: '#255CA1 inset 4px',
      minHeight: 41
    },
    documentButtons: {
      display: 'flex',
      justifyContent: 'flex-end'
    },
    input: {
      marginLeft: theme.spacing(1),
      flex: 1
    },
    searchBar: {
      minWidth: 200,
      backgroundColor: '#FFF',
      border: '1px solid #D0D7D8',
      boxShadow: '0px 1px 16px #0000000A',
      borderRadius: '25px'
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
