import { createStyles, makeStyles } from 'tss-react/mui'

const useStyles = makeStyles(() =>
  createStyles({
    divider: {
      marginBottom: '15px'
    },
    lockIcon: {
      margin: '0 8px'
    }
  })
)

export default useStyles
