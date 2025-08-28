import React from 'react'
import { useAppSelector } from 'state'

import { Box, CircularProgress, Link, Typography, Tooltip } from '@mui/material'
import SupervisedUserCircleIcon from '@mui/icons-material/SupervisedUserCircle'

import { QuerySnapshotInfo, CurrentSnapshot, JobStatus } from 'types'
import { displayVersionsCount } from 'utils/numbers'
import { plural } from 'utils/plural'
import { getVersionName } from 'utils/versions'
import useStyles from './styles'

type VersionItemProps = {
  version: QuerySnapshotInfo
  currentSnapshot: CurrentSnapshot
  onSnapshotChange: (snapshotId: string) => void
}

const VersionItem: React.FC<VersionItemProps> = ({ version, currentSnapshot, onSnapshotChange }) => {
  const { classes, cx } = useStyles()
  const isActive = currentSnapshot.uuid === version.uuid
  const hasCohorts = version.cohorts_count > 0
  const { count } = useAppSelector((state) => state.cohortCreation.request || {})
  const isLoading = count.status
    ? count.status === JobStatus.NEW || count.status === JobStatus.PENDING || count.status === JobStatus.STARTED
    : false

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

          {isLoading && isActive ? (
            <CircularProgress size={12} />
          ) : (
            <Typography variant="caption" className={classes.patientCount}>
              {displayVersionsCount(isActive ? count.includePatient : version.patients_count)}
            </Typography>
          )}
        </Box>
      </Link>

      {hasCohorts && (
        <Tooltip
          title={`${version.cohorts_count} cohorte${plural(
            version.cohorts_count
          )} ont été créées à partir de cette version.`}
        >
          <SupervisedUserCircleIcon className={classes.cohortIcon} />
        </Tooltip>
      )}
    </Box>
  )
}

export default VersionItem
