import { makeStyles } from 'tss-react/mui'

const useStyles = makeStyles()(() => ({
  durationLegend: {
    color: '#153D8A',
    fontWeight: 600,
    fontSize: 12,
    paddingBottom: 10
  },
  inputContainer: {
    padding: '1em',
    display: 'flex',
    flex: '1 1 0%',
    flexDirection: 'column'
  },
  inputItem: {
    margin: '1em',
    width: 'calc(100% - 2em)'
  }
}))

export default useStyles
