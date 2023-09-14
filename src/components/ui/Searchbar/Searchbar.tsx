import React, { ReactNode } from 'react'

import { SearchbarWrapper } from './styles'

type SearchbarProps = {
  children: ReactNode[]
}

const Searchbar = ({ children }: SearchbarProps) => {
  return <SearchbarWrapper>{children.map((child) => child)}</SearchbarWrapper>
}

export default Searchbar
