import { makeStyles } from '@mui/styles'

const useStyles = makeStyles(() => ({
  chips: {
    margin: '12px 6px',
    '&:last-child': {
      marginRight: 0
    }
  }
}))

export default useStyles
