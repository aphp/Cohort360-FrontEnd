import { makeStyles } from 'tss-react/mui'

const useStyles = makeStyles()(() => ({
  datePickerInput: {
    marginTop: 4,
    '& input': {
      padding: 8
    },
    '> div': {
      borderRadius: 12
    },
    '& fieldset': {
      borderColor: '#e9e9ed'
      // TODO: ajouter couleur pour hover
    },
    '& button': {
      color: '#153d8ab3'
    }
  }
}))

export default useStyles
