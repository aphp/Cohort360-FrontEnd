import React from 'react'
import { Grid, Typography, Box } from '@mui/material'
import OpenInNewIcon from '@mui/icons-material/OpenInNew'

import IconButtonWithTooltip from 'components/ui/IconButtonWithTooltip'

import { QuerySnapshotInfo, CurrentSnapshot } from 'types'
import { groupVersionsByDate } from 'utils/groupByDate'
import VersionDateBlock from './VersionDateBlock'

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
  const groupedVersions = groupVersionsByDate(snapshotsHistory)

  return (
    <Grid className={classes.container} style={{ maxHeight: 400, overflow: 'hidden scroll' }}>
      <Grid container justifyContent="space-between" m="10px">
        <Grid container justifyContent="space-between" alignItems="center" m={'0px 10px'}>
          <Typography fontWeight={700}>VERSIONS DE LA REQUÊTE :</Typography>
          <IconButtonWithTooltip
            title="Voir le détail des versions"
            icon={<OpenInNewIcon sx={{ fontSize: '20px' }} />}
            onClick={onOpenVersionsDialog}
          />
        </Grid>
        <Typography sx={{ margin: '0 10px 8px', fontSize: 11, color: 'grey' }}>
          Cliquez sur une des versions pour la consulter.
        </Typography>

        <Box m={'0 1em'}>
          {groupedVersions.map(([date, versions]) => (
            <VersionDateBlock
              key={date}
              date={date}
              versions={versions}
              currentSnapshot={currentSnapshot}
              onSnapshotChange={onSnapshotChange}
            />
          ))}
        </Box>
      </Grid>
    </Grid>
  )
}

export default VersionsSection
