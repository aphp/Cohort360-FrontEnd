import React, { ReactNode } from 'react'

import { StyledSearchbar } from './styles'

type SearchbarProps = {
  children: ReactNode[]
}

const Searchbar = ({ children }: SearchbarProps) => {
  return <StyledSearchbar>{children.map((child) => child)}</StyledSearchbar>
}

export default Searchbar
