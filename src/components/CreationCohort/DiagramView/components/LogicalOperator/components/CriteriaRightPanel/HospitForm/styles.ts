import { makeStyles } from 'tss-react/mui'

const useStyles = makeStyles()(() => ({
  inputItem: {
    margin: '1em'
  },
  durationLegend: {
    color: '#153D8A',
    fontWeight: 600,
    fontSize: 12,
    paddingBottom: 10
  }
}))

export default useStyles
