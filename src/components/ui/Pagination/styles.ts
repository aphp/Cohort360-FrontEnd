import { Pagination, styled } from '@mui/material'
import { NumberInput } from '../NumberInput'

export const StyledPagination = styled(Pagination)(() => ({
  margin: '12px 10px',
  float: 'right',
  '& button': {
    backgroundColor: '#fff',
    color: '#5BC5F2'
  },
  '& .MuiPaginationItem-page.Mui-selected': {
    color: '#0063AF',
    backgroundColor: '#FFF'
  }
}))

export const PaginationInput = styled(NumberInput)(() => ({
  width: 50,
  height: 24,
  margin: '0 4px',
  backgroundColor: '#FFF',
  border: '1px solid #5BC5F2',
  borderRadius: 10,
  padding: 4
}))
