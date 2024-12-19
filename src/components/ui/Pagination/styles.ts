import { IconButton, Pagination, styled } from '@mui/material'
import { NumberInput } from '../NumberInput'

type ColorProps = {
  elemColor?: string
}

export const StyledPagination = styled(Pagination)<ColorProps>(({ elemColor = '#5BC5F2' }) => ({
  margin: '12px 10px',
  float: 'right',
  '& button': {
    backgroundColor: '#fff',
    color: elemColor
  },
  '& .MuiPaginationItem-page.Mui-selected': {
    color: '#fff',
    backgroundColor: elemColor,
    height: 25
  }
}))

export const PaginationInput = styled(NumberInput)<ColorProps>(({ elemColor = '#5BC5F2' }) => ({
  width: 50,
  height: 24,
  margin: '0 4px',
  backgroundColor: '#FFF',
  border: `1px solid ${elemColor}`,
  borderRadius: 10,
  padding: 4
}))

export const StyledButton = styled(IconButton)<ColorProps>(({ elemColor = '#5BC5F2' }) => ({
  color: elemColor,
  padding: 0
}))
