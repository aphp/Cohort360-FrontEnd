import React, { PropsWithChildren, ReactNode } from 'react'

import { SearchbarWrapper } from './styles'

type SearchbarProps = {
  children: ReactNode
  wrap?: boolean
}

const Searchbar = ({ children, wrap }: PropsWithChildren<SearchbarProps>) => {
  return <SearchbarWrapper wrap={wrap}>{children}</SearchbarWrapper>
}

export default Searchbar
