import { Accordion, styled } from '@mui/material'

const AccordionWrapper = styled(Accordion)(() => ({
  margin: 0,
  width: '100%',
  boxShadow: 'none',
  borderRadius: 12,
  border: '1px solid #D1E2F4',
  '&:before': {
    backgroundColor: 'unset'
  },
  '& .MuiAccordionDetails-root': {
    padding: '0 16px 16px'
  },
  '&.MuiAccordion-root:first-of-type': {
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12
  },
  '&.MuiAccordion-root:last-of-type': {
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12
  },
  '&.Mui-expanded': {
    margin: 0
  }
}))

export default AccordionWrapper
