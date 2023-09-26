import { makeStyles } from 'tss-react/mui'

export default makeStyles()({
  paper: {
    width: 400
  },
  openLeftBar: {
    backgroundColor: '#FFF',
    width: 30,
    height: 101,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    boxShadow: '0px 3px 6px #0000000A',
    borderRadius: '2px 0px 0px 2px',
    position: 'fixed',
    marginLeft: -31
  }
})
