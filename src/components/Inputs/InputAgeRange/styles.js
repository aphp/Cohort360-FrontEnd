import { makeStyles } from '@material-ui/core/styles'

const useStyles = makeStyles(() => ({
  gridSection: {
    display: 'grid',
    gridTemplateColumns: '1fr 160px',
    alignItems: 'center'
  },
  inputItem: {
    margin: '1em',
    width: 'calc(100% - 2em)'
  }
}))

export default useStyles
