import React, { PropsWithChildren, ReactNode } from 'react'

import { SearchbarWrapper } from './styles'

type SearchbarProps = {
  children: ReactNode
}

const Searchbar = ({ children }: PropsWithChildren<SearchbarProps>) => {
  return <SearchbarWrapper>{children}</SearchbarWrapper>
}

export default Searchbar
