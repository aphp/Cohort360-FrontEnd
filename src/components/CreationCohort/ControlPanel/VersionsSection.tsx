import React from 'react'
import { Grid, Link, Typography, Tooltip } from '@mui/material'
import SupervisedUserCircleIcon from '@mui/icons-material/SupervisedUserCircle'
import OpenInNewIcon from '@mui/icons-material/OpenInNew'

import IconButtonWithTooltip from 'components/ui/IconButtonWithTooltip'
import { QuerySnapshotInfo, CurrentSnapshot } from 'types'

interface VersionsSectionProps {
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
  return (
    <Grid className={classes.container} style={{ maxHeight: 400, overflow: 'hidden scroll' }}>
      <Grid container justifyContent="space-between" m="10px">
        <Grid container justifyContent="space-between" alignItems="center" m={'0px 10px'}>
          <Typography fontWeight={700}>VERSIONS DE LA REQUÊTE :</Typography>
          <IconButtonWithTooltip
            title="Voir le détail des versions"
            icon={<OpenInNewIcon />}
            onClick={onOpenVersionsDialog}
          />
        </Grid>
        <Typography sx={{ margin: '0 10px 10px', fontSize: 11, color: 'grey' }}>
          Cliquez sur une des versions pour la consulter.
        </Typography>
        <Grid container justifyContent={'space-around'} style={{ marginLeft: '0.5em' }}>
          {snapshotsHistory.map((snapshot, count) => (
            <Grid container key={count} alignItems="center">
              <Link
                onClick={() => onSnapshotChange(snapshot.uuid)}
                underline={currentSnapshot.uuid === snapshot.uuid ? 'none' : 'hover'}
                style={{
                  display: 'flex',
                  cursor: currentSnapshot.uuid === snapshot.uuid ? 'default' : 'pointer',
                  fontWeight: currentSnapshot.uuid === snapshot.uuid ? 'bold' : ''
                }}
              >
                <div style={{ width: 80, textAlign: 'center' }}>{snapshot.name ?? `Version ${snapshot.version}`}</div>
                <div style={{ width: 8 }}> - </div>
                <div style={{ width: 135 }}>{snapshot.patients_count}</div>
              </Link>
              <Grid container alignItems="center" style={{ width: 24, margin: '0 4px' }}>
                {snapshot.cohorts_count > 0 && (
                  <Tooltip
                    title={`${snapshot.cohorts_count} cohorte${
                      snapshot.cohorts_count > 1 ? 's' : ''
                    } ont été créées à partir de cette version.`}
                  >
                    <SupervisedUserCircleIcon fontSize="small" sx={{ color: '#f7a600b3' }} />
                  </Tooltip>
                )}
              </Grid>
            </Grid>
          ))}
        </Grid>
      </Grid>
    </Grid>
  )
}

export default VersionsSection
