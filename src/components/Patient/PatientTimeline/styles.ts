import { makeStyles } from 'tss-react/mui'
const fontSize = 16

const useStyles = makeStyles<{ dotHeight?: number; color?: string }>()((_theme, params) => ({
  centeredTimeline: {
    position: 'relative',
    overflow: 'hidden',
    height: '100%',
    margin: '0 auto',
    width: '100%'
  },
  verticalBar: {
    textAlign: 'center',
    '&:before': {
      position: 'absolute',
      content: '""',
      width: 3,
      background: '#43435B',
      height: '100%',
      zIndex: 0,
      transform: 'translateX(-50%)'
    }
  },
  time: {
    fontSize: fontSize,
    color: '#999'
  },
  timelabel: {
    fontSize: fontSize,
    position: 'relative',
    display: 'block',
    textAlign: 'center',
    fontWeight: 600,
    backgroundColor: '#FFF',
    color: 'black',
    zIndex: 5,
    lineHeight: 1
  },
  collapsedYear: {
    position: 'relative',
    display: 'block',
    textAlign: 'center',
    backgroundColor: '#FFF',
    color: 'black',
    zIndex: 5
  },
  line: {
    height: 1,
    background: '#43435B'
  },
  hospitDot: {
    height: params.dotHeight,
    borderRadius: 50,
    backgroundColor: params.color,
    border: '1px solid #3B3B51'
  },
  pmsiDot: {
    width: 16,
    height: 16,
    borderRadius: 50,
    backgroundColor: params.color,
    border: '1px solid #3B3B51'
  },
  timelineTextRight: {
    fontSize: fontSize,
    color: '#43435B'
  },
  chip: {
    fontSize: fontSize,
    borderRadius: 5
  },
  hospitDates: {
    fontFamily: 'Roboto',
    fontStyle: 'normal',
    fontWeight: 'normal',
    fontSize: 14,
    color: '#43435B'
  },
  hospitTitle: {
    fontFamily: 'Roboto',
    fontStyle: 'normal',
    fontWeight: 500,
    fontSize: 16,
    color: '#43435B',
    textTransform: 'capitalize'
  },
  hospitCard: {
    border: `1px solid ${params.color}`,
    borderLeft: `7px solid ${params.color}`,
    borderRadius: 5
  }
}))

export default useStyles
