import { makeStyles } from 'tss-react/mui'

const useStyles = makeStyles()(() => ({
  selectedCohortGrid: {
    marginTop: '3em'
  },
  selectedCohortTypography: {
    marginTop: '0.35em'
  },
  selectedCohortAutocomplete: {
    marginLeft: '0.7em',
    backgroundColor: 'white',
    width: '26em'
  },
  oneFileGrid: {
    marginTop: '1.5em'
  },
  fileTypeGrid: {
    alignItems: 'center',
    justifyContent: 'center'
  },
  fileTypeSelect: {
    marginLeft: '0.7em',
    borderRadius: 25,
    backgroundColor: '#FFF',
    '& .MuiSelect-select': {
      borderRadius: 25
    }
  },
  selectAllTablesGrid: {
    justifyContent: 'end',
    whiteSpace: 'nowrap',
    pr: '1px'
  },
  selectAllTablesFormControl: {
    display: 'flex',
    gap: '12px',
    margin: 0,
    color: '#0063AF',
    '& span': {
      fontWeight: '800'
    }
  },
  autocomplete: {
    margin: '2px',
    backgroundColor: 'white',
    width: '60%'
  },
  agreeCheckbox: {
    padding: '6px'
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
  dialogHeader: {
    color: '#0063AF',
    marginBlock: 8,
    textDecoration: 'underline',
    textUnderlineOffset: '4px'
  },
  helperText: {
    marginLeft: 0,
    fontStyle: 'italic'
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
  textBody1: {
    color: 'rgba(0, 0, 0, 0.6)',
    fontWeight: '700'
  },
  textBody2: {
    color: 'rgba(0, 0, 0, 0.8)',
    fontWeight: '600'
  },
  tableLabel: {
    color: '#888',
    fontStyle: 'italic',
    fontWeight: '600',
    padding: '0 5px 0 4px'
  }
}))

export default useStyles
