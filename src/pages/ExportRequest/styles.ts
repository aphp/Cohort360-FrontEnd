/**
 * @fileoverview Styles for the ExportRequest page components.
 * Defines Material-UI styles using tss-react for export form and related UI elements.
 */

import { makeStyles } from 'tss-react/mui'

/**
 * Custom hook that returns styled classes for the ExportRequest page components.
 *
 * @returns {Object} Object containing CSS classes for export request styling
 */
const useStyles = makeStyles()(() => ({
  selectedCohortGrid: {
    marginBottom: '3em'
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

  conditionItem: {
    margin: '4px 0 4px 36px',
    position: 'relative',
    color: 'rgba(0, 0, 0, 0.8)',
    width: 'calc(100%)',
    '&::before': {
      position: 'absolute',
      content: "'•'",
      color: 'rgba(0, 0, 0, 0.7)',
      left: -20,
      top: 'calc(50% - 0.5em)',
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

  textBody1: {
    color: 'rgba(0, 0, 0, 0.6)',
    fontWeight: '700'
  },
  textBody2: {
    color: 'rgba(0, 0, 0, 0.8)',
    fontWeight: '600'
  },
  exportTableGrid: {
    padding: '16px 16px 16px 16px',
    backgroundColor: 'white',
    marginBottom: '10px',
    borderColor: 'grey',
    borderRadius: 9,
    border: 'solid',
    borderWidth: 1.5
  },
  tableLabel: {
    color: '#888',
    fontStyle: 'italic',
    fontWeight: '600',
    padding: '0 5px 0 4px'
  },
  selectedTable: {
    color: '#0063AF',
    fontWeight: '700',
    lineHeight: 1.47
  },
  notSelectedTable: {
    color: '#666',
    fontWeight: '700'
  }
}))

export default useStyles
