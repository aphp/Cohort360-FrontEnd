import { makeStyles } from 'tss-react/mui'

export default makeStyles()((theme) => ({
  perimetersChipsDiv: {
    display: 'flex',
    flexWrap: 'wrap',
    listStyle: 'none',
    padding: 0,
    marginTop: 4,
    marginBottom: 0
  },
  item: {
    margin: theme.spacing(0.5),
    padding: 0,
    width: 'fit-content'
  },
  perimetersChip: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#19235A'
  }
}))
