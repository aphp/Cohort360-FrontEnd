import React from 'react'
import useBreadcrumb from '../hooks/useBreadcrumb'
import { Breadcrumbs, Link, Typography } from '@mui/material'
import { Link as RouterLink } from 'react-router-dom'

const Breadcrumb = () => {
  const items = useBreadcrumb()
  return (
    // TODO: style
    <Breadcrumbs>
      {items.map((item, index) => {
        // Si c'est le dernier item, pas de lien
        const isLast = index === items.length - 1
        if (isLast) {
          return <Typography key={index}>{item.label}</Typography>
        }

        return item.url ? (
          <Link key={index} component={RouterLink} to={item.url}>
            {item.label}
          </Link>
        ) : (
          <Typography key={index}>{item.label}</Typography>
        )
      })}
    </Breadcrumbs>
  )
}

export default Breadcrumb
