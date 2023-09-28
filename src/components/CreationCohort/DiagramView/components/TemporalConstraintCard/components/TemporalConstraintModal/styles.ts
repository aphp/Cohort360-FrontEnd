import { makeStyles } from 'tss-react/mui'

const useStyles = makeStyles()(() => ({
  flexBaseline: {
    display: 'flex !important',
    marginTop: '8px !important'
  },
  selectGroupFormControl: {
    margin: '0 8px',
    minWidth: 200,
    height: '25%',
    flexDirection: 'row',
    alignItems: 'baseline'
  },
  selectCriteriaFormControl: {
    display: 'flex',
    height: '75%',
    flexWrap: 'wrap',
    overflow: 'scroll',
    width: '100%',
    flexDirection: 'row',
    margin: '8px 0 0'
  }
}))

export default useStyles
