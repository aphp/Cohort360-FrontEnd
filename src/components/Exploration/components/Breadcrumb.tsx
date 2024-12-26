import React from 'react'
import useBreadcrumb from '../hooks/useBreadcrumb'
import { Breadcrumbs, Link, Typography } from '@mui/material'
import { Link as RouterLink } from 'react-router-dom'

const Breadcrumb = () => {
  const items = useBreadcrumb()
  return (
    // TODO: style à extraire?
    <Breadcrumbs separator=">">
      {items.map((item, index) => {
        // Si c'est le dernier item, pas de lien
        const isLast = index === items.length - 1
        if (isLast) {
          return (
            <Typography style={{ color: '#2b2b2b', fontSize: 14, fontWeight: 'bold' }} key={index}>
              {item.label}
            </Typography>
          )
        }

        return (
          <Link
            key={index}
            component={RouterLink}
            to={item.url}
            style={{
              color: '#BFBABA',
              fontSize: 14,
              fontWeight: 'bold',
              textUnderlineOffset: 3,
              textDecorationColor: '#BFBABA'
            }}
          >
            {item.label}
          </Link>
        )
      })}
    </Breadcrumbs>
  )
}

export default Breadcrumb
