import React from 'react'

import { Box, CircularProgress, Link, Typography, Tooltip } from '@mui/material'

import useStyles from './styles'

type VersionItemProps = {
  isActive: boolean
  count: string
  isLoading: boolean
  name: string
  versionId: string
  icon?: React.ElementType
  iconTooltip?: string
  onSnapshotChange: (snapshotId: string) => void
}

const VersionItem: React.FC<VersionItemProps> = ({
  isActive,
  count,
  isLoading,
  name,
  versionId,
  icon: IconComponent,
  iconTooltip,
  onSnapshotChange
}) => {
  const { classes, cx } = useStyles()
  const hasIcon = !!IconComponent

  return (
    <Box
      className={cx(
        classes.versionItem,
        !hasIcon && classes.versionItemWithPoint,
        !hasIcon && isActive && classes.versionItemActive
      )}
    >
      <Link
        onClick={() => onSnapshotChange(versionId)}
        underline="none"
        className={cx(classes.versionLink, isActive && classes.versionLinkActive)}
      >
        <Box className={classes.contentContainer}>
          <Tooltip title={name}>
            <Typography variant="body2" className={classes.versionName}>
              {name}
            </Typography>
          </Tooltip>

          {isLoading && isActive ? (
            <CircularProgress size={12} />
          ) : (
            <Typography variant="caption" className={classes.patientCount}>
              {count}
            </Typography>
          )}
        </Box>
      </Link>

      {IconComponent && iconTooltip && (
        <Tooltip title={iconTooltip}>
          <IconComponent className={classes.cohortIcon} />
        </Tooltip>
      )}
    </Box>
  )
}

export default VersionItem
