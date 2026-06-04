import { inputBaseClasses, outlinedInputClasses } from '@mui/material'
import { makeStyles } from 'tss-react/mui'

const useStyles = makeStyles()(() => ({
  datePickerInput: {
    marginTop: 4,
    '& .MuiPickersSectionList-root': {
      padding: 8
    },
    '> div': {
      borderRadius: 12
    },
    '& fieldset': {
      borderColor: '#e9e9ed'
    },
    [`& .${inputBaseClasses.root}:hover .${outlinedInputClasses.notchedOutline}`]: {
      borderColor: '#D1D1D9 !important'
    },
    '& button': {
      color: '#153d8ab3'
    }
  }
}))

export default useStyles
