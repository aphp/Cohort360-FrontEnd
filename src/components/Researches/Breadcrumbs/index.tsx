import React from 'react'
import { Link as RouterLink } from 'react-router-dom'
import useBreadcrumbs from 'hooks/researches/useBreadcrumbs'
import { Link, Typography } from '@mui/material'
import { StyledBreadcrumbs } from './style'
import ChevronRight from 'assets/icones/chevron-right.svg?react'

const Breadcrumbs = () => {
  const items = useBreadcrumbs()
  return (
    <StyledBreadcrumbs separator={<ChevronRight />}>
      {items.map((item, index) => {
        // Si c'est le dernier item, pas de lien
        const isLast = index === items.length - 1
        if (isLast) {
          return <Typography key={item.label}>{item.label}</Typography>
        }

        return (
          <Link key={item.label} component={RouterLink} to={item.url}>
            {item.label}
          </Link>
        )
      })}
    </StyledBreadcrumbs>
  )
}

export default Breadcrumbs
