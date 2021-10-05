import { makeStyles } from '@material-ui/core/styles'
// import { smallDrawerWidth, largeDrawerWidth } from '../LeftSideBar/LeftSideBar'

export default makeStyles((theme) => ({
  root: {
    minHeight: '72px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#E6F1FD',
    boxShadow: 'none'
  },
  perimetersChipsDiv: {
    display: 'flex',
    flexWrap: 'wrap',
    listStyle: 'none',
    padding: 0,
    marginTop: 4,
    marginBottom: 0
  },
  item: {
    margin: theme.spacing(0.5),
    padding: 0,
    width: 'fit-content'
  },
  perimetersChip: {
    backgroundColor: '#0063AF',
    color: '#FFF',
    fontStyle: 'italic',
    fontSize: '12px'
  },
  populationLabel: {
    color: '#19235A',
    textDecoration: 'underline'
  },
  deleteModalTitle: {
    ' & h2': {
      fontSize: '18px',
      fontFamily: "'Montserrat', sans-serif",
      color: '#0063AF',
      textTransform: 'none',
      lineHeight: 2
    }
  }
}))
