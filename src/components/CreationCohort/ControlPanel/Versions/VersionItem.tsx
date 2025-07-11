import React from 'react'
import moment from 'moment'
import { Link, Typography, Tooltip, Box } from '@mui/material'
import SupervisedUserCircleIcon from '@mui/icons-material/SupervisedUserCircle'

import { QuerySnapshotInfo, CurrentSnapshot } from 'types'
import { displayCount } from 'utils/numbers'
import { getVersionName } from 'utils/versions'
import useVersionItemStyles from './styles'

type VersionItemProps = {
  version: QuerySnapshotInfo
  currentSnapshot: CurrentSnapshot
  onSnapshotChange: (snapshotId: string) => void
}

const VersionItem: React.FC<VersionItemProps> = ({ version, currentSnapshot, onSnapshotChange }) => {
  const { classes, cx } = useVersionItemStyles()
  const isActive = currentSnapshot.uuid === version.uuid
  const hasCohorts = version.cohorts_count > 0

  return (
    <Box
      className={cx(
        classes.versionItem,
        !hasCohorts && classes.versionItemWithPoint,
        !hasCohorts && isActive && classes.versionItemActive
      )}
    >
      <Link
        onClick={() => onSnapshotChange(version.uuid)}
        underline="none"
        className={cx(classes.versionLink, isActive && classes.versionLinkActive)}
      >
        <Box className={classes.contentContainer}>
          <Tooltip title={getVersionName(version)}>
            <Typography variant="body2" className={classes.versionName}>
              {getVersionName(version)}
            </Typography>
          </Tooltip>

          <Typography variant="caption" className={classes.patientCount}>
            {displayCount(version.patients_count)} patient{version.patients_count > 1 ? 's' : ''}
          </Typography>
        </Box>

        <Typography variant="caption" className={classes.time}>
          {moment(version.created_at).format('HH:mm')}
        </Typography>
      </Link>

      {hasCohorts && (
        <Tooltip
          title={`${version.cohorts_count} cohorte${
            version.cohorts_count > 1 ? 's' : ''
          } ont été créées à partir de cette version.`}
        >
          <SupervisedUserCircleIcon className={classes.cohortIcon} />
        </Tooltip>
      )}
    </Box>
  )
}

export default VersionItem
