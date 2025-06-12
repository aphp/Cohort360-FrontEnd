import { makeStyles } from 'tss-react/mui'
import { Theme } from '@mui/material/styles'

const useStyles = makeStyles()((theme: Theme) => ({
  draggedCriteriaItem: {
    height: 5,
    //opacity: 0.4,
    // border: '1px solid #0063AF',
    background: '#0063AF',
    borderRadius: 4
  },
  criteriaItem: {
    borderRadius: 4,
    padding: 8,
    marginTop: 12,
    minWidth: 400,
    maxWidth: 930,
    position: 'relative' /*,
    '&::before': {
      width: 38,
      height: 4,
      content: "''",
      position: 'absolute',
      background: '#19235A',
      marginLeft: -46
    }*/
  },
  noBefore: {
    '&::before': {
      display: 'none'
    }
  },
  title: {
    marginLeft: 4
  },
  secondItem: {
    overflow: 'hidden',
    [theme.breakpoints.down('xl')]: {
      order: 2
    }
  }
}))

export default useStyles
