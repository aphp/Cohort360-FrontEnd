import { Accordion, styled } from '@mui/material'

const AccordionWrapper = styled(Accordion)(() => ({
  margin: 0,
  width: '100%',
  boxShadow: 'none',
  borderRadius: 12,
  border: '1px solid #D1E2F4',
  '&:before': {
    backgroundColor: 'unset'
  }
}))

export default AccordionWrapper
