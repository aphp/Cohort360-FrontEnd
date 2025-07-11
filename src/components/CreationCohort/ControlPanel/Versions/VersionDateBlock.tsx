import React from 'react'
import { Typography, Box } from '@mui/material'

import { QuerySnapshotInfo, CurrentSnapshot } from 'types'
import VersionItem from './VersionItem'

type VersionDateBlockProps = {
  date: string
  versions: QuerySnapshotInfo[]
  currentSnapshot: CurrentSnapshot
  onSnapshotChange: (snapshotId: string) => void
}

const VersionDateBlock: React.FC<VersionDateBlockProps> = ({ date, versions, currentSnapshot, onSnapshotChange }) => {
  return (
    <Box mb={1}>
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

      {versions.map((version) => (
        <VersionItem
          key={version.uuid}
          version={version}
          currentSnapshot={currentSnapshot}
          onSnapshotChange={onSnapshotChange}
        />
      ))}
    </Box>
  )
}

export default VersionDateBlock
