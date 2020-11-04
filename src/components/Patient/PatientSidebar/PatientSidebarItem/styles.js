import { makeStyles } from '@material-ui/core/styles'

export default makeStyles({
  listItem: {
    '&:hover': {
      cursor: 'pointer',
      backgroundColor: '#FAF9F9'
    }
  },
  genderIcon: {
    height: '25px',
    fill: '#0063AF'
  },
  genderIconContainer: {
    minWidth: '32px'
  },
  deceasedChip: {
    fontSize: '11px',
    backgroundColor: '#D0D7D8',
    color: '#FFF',
    fontWeight: 'bold',
    marginRight: '16px'
  },
  aliveChip: {
    fontSize: '11px',
    backgroundColor: '#5BC5F2',
    color: '#FFF',
    fontWeight: 'bold',
    marginRight: '16px'
  }
})
