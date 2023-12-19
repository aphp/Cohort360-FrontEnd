import React, { PropsWithChildren } from 'react'

import { SearchbarWrapper } from './styles'

type SearchbarProps = {
  wrapped?: boolean
}

const Searchbar = ({ children, wrapped }: PropsWithChildren<SearchbarProps>) => {
  return <SearchbarWrapper wrapped={wrapped}>{children}</SearchbarWrapper>
}

export default Searchbar
