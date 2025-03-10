import { makeStyles } from 'tss-react/mui'

const useStyles = makeStyles()(() => ({
  dateFilterMenu: {
    '& .MuiPopover-paper': {
      borderRadius: 12
    }
  }
}))

export default useStyles
