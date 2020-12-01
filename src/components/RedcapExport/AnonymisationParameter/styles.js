import { makeStyles } from '@material-ui/core/styles'

const useStyles = makeStyles(() => ({
  cardAnonymParameters: {
    margin: 20,
    padding: 20,
    width: '50%',
    textAlign: 'center',
    marginLeft: 'auto',
    marginRight: 'auto'
  },
  alignAnonymParameters: {
    display: 'flex'
  },
  sliderAnonymParameters: {
    width: '60%',
    marginLeft: '30px'
  },
  parameterName: {
    width: '20%'
  }
}))

export default useStyles
