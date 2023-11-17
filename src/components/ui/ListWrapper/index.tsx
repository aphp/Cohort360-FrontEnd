import { List, styled } from '@mui/material'

type CustomProps = {
  selected?: boolean
}

export const ListWrapper = styled(List)<CustomProps>(() => ({
  width: '100%',
  padding: 0
}))
