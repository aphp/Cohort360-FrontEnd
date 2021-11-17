import { makeStyles } from '@material-ui/core/styles'

const useStyles = makeStyles((theme) => ({
  divider: {
    marginBottom: '15px'
  },
  carouselContainer: {
    position: 'relative',
    overflow: 'hidden',
    width: '100%',
    height: 360,
    '&:hover': {
      '& svg': {
        opacity: 1,
        transition: 'all 250ms ease-out'
      }
    }
  },
  carouselPaper: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center'
  },
  indicator: {
    position: 'absolute',
    top: 'calc(50% - 24px)',
    '& svg': {
      opacity: 0,
      transition: 'all 250ms ease-in'
    }
  },
  leftIndicator: {
    left: theme.spacing(2)
  },
  rightIndicator: {
    right: theme.spacing(2)
  },
  dotIndicatorContainer: {
    position: 'absolute',
    bottom: theme.spacing(8),
    right: 'calc(50% - 31.5px)',
    '& svg': {
      cursor: 'pointer',
      opacity: 0,
      transition: 'all 250ms ease-in',
      fontSize: '21px'
    }
  },
  videoResponsive: {
    overflow: 'hidden',
    position: 'relative',
    height: 0,
    '& iframe': {
      left: 0,
      top: 0,
      height: '100%',
      width: '100%',
      position: 'absolute'
    }
  }
}))

export default useStyles
