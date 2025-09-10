import React from 'react'
import { Grid, Typography, Box } from '@mui/material'
import OpenInNewIcon from '@mui/icons-material/OpenInNew'
import SupervisedUserCircleIcon from '@mui/icons-material/SupervisedUserCircle'

import IconButtonWithTooltip from 'components/ui/IconButtonWithTooltip'
import VersionItem from './VersionItem'

import { QuerySnapshotInfo, CurrentSnapshot, JobStatus } from 'types'
import { groupByDate } from 'utils/dates'
import { displayVersionsCount } from 'utils/numbers'
import { plural } from 'utils/string'
import { getVersionName } from 'mappers/versions'
import { useAppSelector } from 'state'

type VersionsSectionProps = {
  snapshotsHistory: QuerySnapshotInfo[]
  currentSnapshot: CurrentSnapshot
  onSnapshotChange: (snapshotId: string) => void
  onOpenVersionsDialog: () => void
  classes: {
    container: string
    boldText: string
  }
}

const VersionsSection: React.FC<VersionsSectionProps> = ({
  snapshotsHistory,
  currentSnapshot,
  onSnapshotChange,
  onOpenVersionsDialog,
  classes
}) => {
  const groupedVersions = groupByDate(snapshotsHistory, 'created_at')
  const { count } = useAppSelector((state) => state.cohortCreation.request || {})

  const isLoading = count?.status
    ? count.status === JobStatus.NEW || count.status === JobStatus.PENDING || count.status === JobStatus.STARTED
    : false

  return (
    <Grid className={classes.container} style={{ maxHeight: 400, overflow: 'hidden scroll' }}>
      <Grid container justifyContent="space-between" m="10px">
        <Grid container justifyContent="space-between" alignItems="center">
          <Typography fontWeight={700}>VERSIONS DE LA REQUÊTE :</Typography>
          <IconButtonWithTooltip
            title="Voir le détail des versions"
            icon={<OpenInNewIcon sx={{ fontSize: '20px' }} />}
            onClick={onOpenVersionsDialog}
          />
        </Grid>
        <Typography sx={{ margin: '0 0 8px', fontSize: 11, color: 'grey' }}>
          Cliquez sur une des versions pour la consulter.
        </Typography>

        <Box width="100%" sx={{ minWidth: 0 }}>
          {groupedVersions.map(([date, versions]) => (
            <Box key={date} mb={1}>
              <Typography
                sx={{
                  fontWeight: 600,
                  color: '#090909',
                  marginBottom: '4px',
                  fontSize: '13px'
                }}
              >
                {date}
              </Typography>

              {versions.map((version) => {
                const isActive = currentSnapshot.uuid === version.uuid
                const hasCohorts = version.cohorts_count > 0
                const versionProps = {
                  isActive,
                  count: displayVersionsCount(isActive ? count.includePatient : version.patients_count),
                  isLoading: isLoading && isActive,
                  name: getVersionName(version),
                  versionId: version.uuid,
                  icon: hasCohorts ? SupervisedUserCircleIcon : undefined,
                  iconTooltip: hasCohorts
                    ? `${version.cohorts_count} cohorte${plural(version.cohorts_count)} créée${plural(
                        version.cohorts_count
                      )} à partir de cette version.`
                    : undefined,
                  onSnapshotChange
                }

                return <VersionItem key={version.uuid} {...versionProps} />
              })}
            </Box>
          ))}
        </Box>
      </Grid>
    </Grid>
  )
}

export default VersionsSection
