import { makeStyles } from 'tss-react/mui'

export default makeStyles()(() => ({
  root: {
    width: '100%'
  },
  head: {
    background: 'rgb(209, 226, 244)',
    color: 'rgb(0, 99, 175)',
    fontSize: 11,
    fontWeight: 'bold',
    textTransform: 'uppercase'
  },
  visuallyHidden: {
    border: 0,
    clip: 'rect(0 0 0 0)',
    height: 1,
    margin: -1,
    overflow: 'hidden',
    padding: 0,
    position: 'absolute',
    top: 20,
    width: 1
  },
  loadingSpinnerContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  }
}))
