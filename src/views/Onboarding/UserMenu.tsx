import { Avatar, ButtonBase, Menu, MenuItem, Typography } from '@mui/material'
import React, { useState } from 'react'
import { useNavigate } from 'react-router'

import { useAppDispatch, useAppSelector } from 'state'
import { logout } from 'state/me'

import useStyles from './styles'

const getInitials = (name: string) =>
  name
    .trim()
    .split(/\s+/)
    .map((word) => word[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()

const UserMenu = () => {
  const { classes } = useStyles()
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const displayName = useAppSelector((state) => state.me?.displayName)
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null)

  if (!displayName) {
    return null
  }

  const onLogout = async () => {
    setAnchorEl(null)
    await dispatch(logout())
    navigate('/', { replace: true })
  }

  return (
    <>
      <ButtonBase
        className={classes.userBox}
        aria-haspopup="menu"
        aria-expanded={anchorEl !== null}
        onClick={(event) => setAnchorEl(event.currentTarget)}
      >
        <Avatar className={classes.avatar}>{getInitials(displayName)}</Avatar>
        <Typography className={classes.user}>{displayName}</Typography>
      </ButtonBase>
      <Menu
        anchorEl={anchorEl}
        open={anchorEl !== null}
        onClose={() => setAnchorEl(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        slotProps={{ paper: { className: classes.userMenu } }}
      >
        <MenuItem className={classes.userMenuItem} onClick={onLogout}>
          Se déconnecter
        </MenuItem>
      </Menu>
    </>
  )
}

export default UserMenu
