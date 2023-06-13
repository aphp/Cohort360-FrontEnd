import { makeStyles } from 'tss-react/mui'

export default makeStyles()({
  listItem: {
    '&:hover': {
      cursor: 'pointer',
      backgroundColor: '#FAF9F9'
    }
  },
  selectedListItem: {
    backgroundColor: '#FAF9F9',
    cursor: 'default'
  },
  genderIcon: {
    height: '25px',
    fill: '#0063AF'
  },
  genderIconContainer: {
    minWidth: '32px'
  },
  chip: {
    fontSize: '11px',
    color: '#FFF',
    fontWeight: 'bold',
    marginRight: '16px'
  }
})
