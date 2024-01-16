import { makeStyles } from 'tss-react/mui'

const useStyles = makeStyles()(() => ({
  accordion: {
    marginTop: 12,
    '&::before': {
      content: 'none'
    }
  },
  accordionContent: {
    padding: '8px 32px 16px'
  },
  autocomplete: {
    margin: '2px',
    backgroundColor: 'white'
  },
  agreeCheckbox: {
    padding: '6px'
  },
  checkbox: {
    padding: 0
  },
  conditionItem: {
    margin: '4px 0 4px 36px',
    position: 'relative',
    color: 'rgba(0, 0, 0, 0.8)',
    '&::before': {
      position: 'absolute',
      content: "'•'",
      color: 'rgba(0, 0, 0, 0.7)',
      left: -20,
      top: 'calc(50% - 11px)',
      fontSize: 26,
      lineHeight: '22px'
    }
  },
  dialogTitle: {
    fontSize: '22px',
    padding: '20px 30px 16px',
    textDecoration: 'underline',
    textUnderlineOffset: '8px'
  },
  dialogContent: {
    padding: '0 30px'
  },
  dialogHeader: {
    color: '#0063AF',
    marginBlock: 8,
    textDecoration: 'underline',
    textUnderlineOffset: '4px'
  },
  heading: {
    fontWeight: 'inherit'
  },
  helperText: {
    marginLeft: 0,
    fontStyle: 'italic'
  },
  radioGroup: {
    justifyContent: 'space-between',
    width: '100%'
  },
  selectAgreeConditions: {
    display: 'flex',
    gap: '8px',
    margin: 0,
    paddingLeft: '3px',
    '& span': {
      fontWeight: '800'
    }
  },
  selectAllTables: {
    display: 'flex',
    gap: '12px',
    margin: 0,
    color: '#0063AF',
    '& span': {
      fontWeight: '800'
    }
  },
  selectedTable: {
    color: '#0063AF',
    fontWeight: '700',
    lineHeight: 1.47
  },
  notSelectedTable: {
    color: '#666',
    fontWeight: '700'
  },
  tableCode: {
    color: '#888',
    fontStyle: 'italic',
    fontWeight: '600',
    padding: '0 5px 0 4px'
  },
  tableSubtitle: {
    color: '#fc1847'
  },
  textBody1: {
    color: 'rgba(0, 0, 0, 0.6)',
    fontWeight: '700'
  },
  textBody2: {
    color: 'rgba(0, 0, 0, 0.8)',
    fontWeight: '600'
  },
  warningInfo: {
    marginTop: '12px'
  },
  warningIcon: {
    marginRight: '12px'
  },
  warningNote: {
    color: '#ed6c02',
    fontSize: '12px',
    fontWeight: '600'
  }
}))

export default useStyles
