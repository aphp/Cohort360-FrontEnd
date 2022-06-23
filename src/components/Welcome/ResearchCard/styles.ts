import { makeStyles, createStyles } from '@mui/styles'

const useStyles = makeStyles(() =>
  createStyles({
    tableContainer: {
      marginTop: '16px'
    },
    link: {
      color: '#5BC5F2',
      fontSize: '13px',
      fontWeight: 600,
      cursor: 'pointer'
    }
  })
)

export default useStyles
