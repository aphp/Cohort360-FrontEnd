import React, { PropsWithChildren, ReactNode } from 'react'
import { ListItemText } from '@mui/material'

type ListItemProps = {
  children: ReactNode
  id: string
}

const ListItem = ({ children, id }: PropsWithChildren<ListItemProps>) => {
  return <ListItemText id={id}>{children}</ListItemText>
}

export default ListItem
