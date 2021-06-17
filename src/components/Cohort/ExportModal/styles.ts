import { makeStyles } from '@material-ui/core/styles'

const useStyles = makeStyles((theme) => ({
  tableTitle: { marginBlock: 8 },
  list: {
    border: `1px solid ${theme.palette.grey[400]}`,
    borderRadius: 4,
    maxHeight: 450,
    minHeight: 200,
    overflow: 'auto'
  },
  tableListElement: {}
}))

export default useStyles
