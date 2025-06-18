/**
 * @fileoverview Styles for the Export page component.
 * Defines Material-UI styles using tss-react for export-related UI elements.
 */

import { makeStyles } from 'tss-react/mui'

/**
 * Custom hook that returns styled classes for the Export page.
 *
 * @returns {Object} Object containing CSS classes for export page styling
 */
const useStyles = makeStyles()(() => ({
  newExportButton: {
    backgroundColor: '#5BC5F2',
    borderRadius: 25,
    border: 'none',
    color: '#FFF',
    padding: '2px 15px',
    '&:hover': {
      backgroundColor: '#499cbf'
    }
  },
  filterButton: {
    backgroundColor: '#5BC5F2',
    borderRadius: 25,
    padding: '2px 8px',
    border: 'none',
    color: '#FFF',
    width: '20%',
    '&:hover': {
      backgroundColor: '#499cbf'
    }
  }
}))

export default useStyles
