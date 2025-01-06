import React from 'react'
import useBreadcrumb from '../hooks/useBreadcrumb'
import { Breadcrumbs, Link } from '@mui/material'

const Breadcrumb = () => {
  const items = useBreadcrumb()
  return (
    // TODO: style
    <Breadcrumbs>
      {items.map((item, index) => (
        <Link key={index} href={item.url}>
          {item.label}
        </Link>
      ))}
    </Breadcrumbs>
  )
}

export default Breadcrumb
