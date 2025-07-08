import { makeStyles } from 'tss-react/mui'

const useStyles = makeStyles()(() => ({
  divider: {
    marginBottom: '15px'
  },
  markdown: {
    color: '#303030',
    '& ul': {
      margin: 0,
      padding: '0 0 0 16px',
      listStyle: 'none',
      '& li::before': {
        content: '"•"',
        display: 'inline-block',
        marginRight: '4px'
      },
      '& li': {
        padding: '0 0 8px'
      }
    }
  }
}))

export default useStyles
