import { IconButton, Pagination, styled } from '@mui/material'
import { NumberInput } from '../NumberInput'

type ColorProps = {
  elemcolor?: string
}

export const StyledPagination = styled(Pagination)<ColorProps>(({ elemcolor = '#5BC5F2' }) => ({
  margin: '12px 10px',
  float: 'right',
  '& button': {
    backgroundColor: '#fff',
    color: elemcolor
  },
  '& .MuiPaginationItem-page.Mui-selected': {
    color: '#fff',
    backgroundColor: elemcolor
  }
}))

export const PaginationInput = styled(NumberInput)<ColorProps>(({ elemcolor = '#5BC5F2' }) => ({
  width: 50,
  height: 24,
  margin: '0 4px',
  backgroundColor: '#FFF',
  border: `1px solid ${elemcolor}`,
  borderRadius: 10,
  padding: 4
}))

export const StyledButton = styled(IconButton)<ColorProps>(({ elemcolor = '#5BC5F2' }) => ({
  color: elemcolor,
  padding: 0
}))
