import { makeStyles } from 'tss-react/mui'
const marginNextCentralLine = 10
const fontSize = 16
const dotSize = 16
const emptyYearHeight = '0.7em'

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
  loadingContainer: {
    width: '50%',
    marginLeft: '50%'
  },
  timeline: {
    display: 'flex',
    position: 'relative',
    margin: '0 0 0 0',
    padding: 0,
    listStyle: 'none',
    '& li': {
      position: 'relative',
      marginRight: 0
    }
  },
  timelineItem: {
    padding: '8px 10px'
  },
  timelineRightContent: {
    content: '""',
    display: 'flex',
    padding: 3,
    alignItems: 'center'
  },
  time: {
    fontSize: fontSize,
    color: '#999',
    textAlign: 'left',
    marginRight: 8
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
  timelineElementsRight: {
    position: 'absolute',
    left: `${-1 * marginNextCentralLine}px`,
    width: '100%',
    alignItems: 'center',
    display: 'flex'
  },
  lineRight: {
    position: 'absolute',
    display: 'inline-block',
    height: 1,
    width: `${1.5 * marginNextCentralLine}px`,
    background: '#43435B',
    zIndex: 0
  },
  timelineElementsLeft: {
    position: 'absolute',
    width: `calc(100% + ${marginNextCentralLine}px)`,
    height: '100%',
    top: 15,
    zIndex: 1
  },
  dotLeft: {
    position: 'absolute',
    width: dotSize,
    height: params.dotHeight,
    borderRadius: 50,
    backgroundColor: params.color,
    display: 'inline-block',
    transform: 'translateX(50%) translateY(-100%) translateY(10px)',
    border: '1px solid #3B3B51',
    zIndex: 1,
    right: 0
  },
  dotRight: {
    position: 'relative',
    width: dotSize,
    height: dotSize,
    borderRadius: 50,
    backgroundColor: params.color,
    display: 'inline-block',
    transform: 'translateX(-50%)',
    border: '1px solid #3B3B51',
    zIndex: 1
  },
  lineLeft: {
    position: 'absolute',
    height: 1,
    width: `${2 * marginNextCentralLine}px`,
    background: '#43435B',
    zIndex: -2,
    right: 0
  },
  timelineTextRight: {
    textAlign: 'left',
    fontSize: fontSize,
    marginRight: '.7rem',
    color: '#43435B',
    zIndex: 5
  },
  chip: {
    fontSize: fontSize,
    borderRadius: 5,
    margin: 8
  },
  timelineRight: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-start',
    width: '100%'
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
    marginBottom: '.2rem',
    textTransform: 'capitalize'
  },
  hospitText: {
    marginLeft: 5
  },
  detailsButton: {
    fontSize: 12,
    color: '#999',
    float: 'right',
    margin: 2,
    cursor: 'pointer',
    fontWeight: 'bold',
    textDecoration: 'underline',
    backgroundColor: '#fff',
    border: 'none'
  },
  leftElements: {
    position: 'relative',
    width: `calc(50% - ${marginNextCentralLine}px)`,
    marginRight: `${marginNextCentralLine}px`
  },
  rightElements: {
    position: 'relative',
    width: `calc(50% - ${marginNextCentralLine}px)`,
    marginLeft: `${marginNextCentralLine}px`,
    top: 3
  },
  leftHospitCard: {
    border: `1px solid ${params.color}`,
    borderLeft: `7px solid ${params.color}`,
    padding: '.4rem',
    paddingTop: '.2rem',
    borderRadius: 5
  },
  emptyYear: {
    height: emptyYearHeight
  }
}))

export default useStyles
