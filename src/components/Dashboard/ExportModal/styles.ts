import { makeStyles } from 'tss-react/mui'
import { Theme } from '@mui/material/styles'

const useStyles = makeStyles((theme: Theme) => ({
  tableTitle: { marginBlock: 8 },
  list: {
    border: `1px solid ${theme.palette.grey[400]}`,
    borderRadius: 4,
    maxHeight: 300,
    minHeight: 200,
    overflow: 'auto'
  },
  conditionItem: {
    margin: '4px 0 4px 36px',
    position: 'relative',
    '&::before': {
      position: 'absolute',
      content: "'•'",
      color: '#19235A',
      left: -20,
      top: 'calc(50% - 11px)',
      fontSize: 26,
      lineHeight: '22px'
    }
  },
  heading: {
    fontWeight: 'inherit'
  },
  accordion: {
    marginTop: 12,
    '&::before': {
      content: 'none'
    }
  }
}))

export default useStyles
