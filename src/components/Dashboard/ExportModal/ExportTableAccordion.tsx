import { Accordion, AccordionSummary, styled } from '@mui/material'

type CustomProps = {
  error: boolean
}

export const ExportTableAccordion = styled(Accordion)<CustomProps>(({ theme, error }) => ({
  border: `${error ? 2 : 1}px solid ${error ? 'red' : theme.palette.divider}`,
  width: '100%',
  '&:not(:last-child)': {
    borderBottom: `${error ? '2px solid red' : 0}`
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
