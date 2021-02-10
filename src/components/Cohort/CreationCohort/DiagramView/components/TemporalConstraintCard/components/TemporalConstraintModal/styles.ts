import { makeStyles } from '@material-ui/core'

const useStyles = makeStyles(() => ({
  title: {
    ' & h2': {
      fontSize: '18px',
      fontFamily: "'Montserrat', sans-serif",
      color: '#0063AF',
      textTransform: 'none',
      lineHeight: 2
    }
  },
  gridItemIdStart: {
    width: '150px',
    marginTop: '100px'
  },
  gridItemIdEnd: {
    width: '150px',
    marginTop: '100px'
  },
  gridItemTrendingIcon: {
    width: '35px',
    marginTop: '115px',
    marginLeft: '10px'
  },
  gridItemTemporalConstraint: {
    width: '500px'
  },
  divTemporalConstraintDetail: {
    width: '100%',
    height: '300px',
    border: '1px solid #C4C4C4',
    borderRadius: '5px'
  },
  titleTemporalConstraint: {
    textAlign: 'center',
    ' & h2': {
      fontSize: '15px',
      fontFamily: "'Montserrat', sans-serif",
      color: '#0063AF',
      textTransform: 'none',
      lineHeight: 2
    }
  },
  selectTemporalConstraint: {
    width: '75%',
    marginLeft: '60px'
  },
  gridTemporalConstraintOptions: {
    display: 'flex',
    flexDirection: 'row',
    marginTop: '50px',
    marginLeft: '5px'
  },
  gridTemporalContraintOptionsSelect: {
    marginRight: '94px'
  },
  sizeInput: {
    width: '100px'
  }
}))

export default useStyles
