import { ListItem, styled } from '@mui/material'

type CustomProps = {
  selected?: boolean
}

export const ListItemWrapper = styled(ListItem)<CustomProps>(({ selected }) => ({
  ...(selected && {
    backgroundColor: '#FAF9F9',
    cursor: 'default'
  }),
  ...(!selected && {
    '&:hover': {
      cursor: 'pointer',
      backgroundColor: '#FAF9F9'
    }
  })
}))
