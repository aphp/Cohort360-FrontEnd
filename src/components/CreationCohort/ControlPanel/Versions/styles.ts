import { makeStyles } from 'tss-react/mui'

const useStyles = makeStyles()(() => ({
  versionItem: {
    position: 'relative',
    paddingLeft: 24,
    '&::before': {
      content: '""',
      position: 'absolute',
      left: 8,
      top: 0,
      bottom: 0,
      width: 2,
      backgroundColor: '#E0E0E0'
    }
  },
  versionItemWithPoint: {
    '&::after': {
      content: '""',
      position: 'absolute',
      left: 6,
      top: 6,
      width: 6,
      height: 6,
      borderRadius: '50%',
      backgroundColor: '#BDBDBD'
    }
  },
  versionItemActive: {
    '&::after': {
      backgroundColor: '#1976D2'
    }
  },
  versionLink: {
    display: 'block',
    textDecoration: 'none',
    paddingBottom: 4,
    fontWeight: 'normal',
    color: 'inherit',
    cursor: 'pointer',
    '&:hover': {
      textDecoration: 'underline'
    }
  },
  versionLinkActive: {
    cursor: 'default',
    fontWeight: 700,
    color: '#153D8A',
    '&:hover': {
      textDecoration: 'none'
    }
  },
  contentContainer: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  versionName: {
    fontWeight: 'inherit',
    display: '-webkit-box',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    lineHeight: 1.1,
    fontSize: 13,
    flex: 1,
    marginRight: 8,
    color: '#153D8A'
  },
  patientCount: {
    color: '#666',
    fontSize: 11,
    fontWeight: 'normal',
    flexShrink: 0,
    whiteSpace: 'nowrap'
  },
  time: {
    color: '#666',
    fontSize: 11,
    display: 'block'
  },
  cohortIcon: {
    color: '#f7a600b3',
    position: 'absolute',
    left: -1,
    top: -2,
    width: 20,
    height: 20,
    backgroundColor: '#FFF',
    borderRadius: '50%'
  }
}))

export default useStyles
