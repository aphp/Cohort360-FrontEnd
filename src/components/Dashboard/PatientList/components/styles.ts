import { makeStyles } from 'tss-react/mui'
import { Theme } from '@mui/material/styles'

const useStyles = makeStyles()((theme: Theme) => ({
  chartOverlay: {
    display: 'flex',
    flexDirection: 'column',
    margin: theme.spacing(2),
    padding: '0.7rem',
    backgroundColor: '#FFF',
    height: '300px',
    width: '100%',
    borderRadius: '8px',
    alignItems: 'center',
    fontSize: '16px'
  },
  chartTitle: {
    borderBottom: '2px inset #E6F1FD',
    paddingBottom: '10px'
  }
}))

export default useStyles
