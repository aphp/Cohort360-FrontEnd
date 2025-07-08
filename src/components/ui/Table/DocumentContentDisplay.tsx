import React from 'react'
import { Grid, TableCell, TableRow as TableRowMui, Typography } from '@mui/material'
import Parse from 'html-react-parser'
import DOMPurify from 'dompurify'

type DocumentContentDisplayProps = {
  id: string
  length: number
  docContent: string
}

const DocumentContentDisplay = ({ id, length, docContent }: DocumentContentDisplayProps) => {
  return (
    <TableRowMui id={id}>
      <TableCell colSpan={length} sx={{ padding: '0 16px 16px' }}>
        <Grid
          container
          sx={{
            backgroundColor: '#F8F9FA',
            borderRadius: '8px',
            boxShadow: '2px 3px 3px -5px #000',
            border: '1px solid #EBEBEB'
          }}
          p={2}
        >
          <Typography fontSize={12} fontWeight={500} fontStyle={'italic'}>
            {Parse(DOMPurify.sanitize(docContent))}
          </Typography>
        </Grid>
      </TableCell>
    </TableRowMui>
  )
}

export default DocumentContentDisplay
