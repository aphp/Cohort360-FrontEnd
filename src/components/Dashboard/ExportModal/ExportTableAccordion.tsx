import { Accordion, AccordionSummary, styled } from '@mui/material'

export const ExportTableAccordion = styled(Accordion)(({ theme }) => ({
  border: `1px solid ${theme.palette.divider}`,
  width: '100%',
  '&:not(:last-child)': {
    borderBottom: 0
  },
  '&::before': {
    display: 'none'
  },
  '&.Mui-expanded': {
    padding: '8px 0'
  }
}))

export const ExportTableAccordionSummary = styled(AccordionSummary)(() => ({
  padding: '0 32px',
  '& .MuiAccordionSummary-expandIconWrapper.Mui-expanded': {
    transform: 'rotate(0deg)'
  },
  '& .MuiAccordionSummary-contentGutters': {
    margin: 0
  },
  '& .MuiAccordionSummary-content.Mui-expanded': {
    margin: 0
  },
  '&.Mui-expanded': {
    minHeight: '56px'
  }
}))
