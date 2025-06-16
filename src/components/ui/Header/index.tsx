import React from 'react'

import { Box, Grid, IconButton, Skeleton, Tooltip, Typography } from '@mui/material'

import FavStar from 'components/ui/FavStar'
import AccessBadge, { AccessLevel } from 'components/ui/AccessBadge'
import CohortInfo from 'components/ui/CohortInfo'
import ExpandableChipsLine from 'components/ui/ExpandableChips'

import { format } from 'utils/numbers'

type HeaderLayoutProps = {
  icon?: React.ReactElement
  title: string
  description?: string
  cohortId?: string
  patientsCount?: number
  perimeters?: string[]
  accessLevel?: AccessLevel
  showActions?: boolean
  isFavorite?: boolean
  loading?: boolean
  onToggleFavorite?: () => void
  actionsMenu?: React.ReactNode
  searchArea?: React.ReactNode
  patientCard?: React.ReactNode
  goBackButton?: React.ReactNode
}

const HeaderLayout: React.FC<HeaderLayoutProps> = ({
  icon,
  title,
  description,
  cohortId,
  patientsCount,
  perimeters = [],
  accessLevel,
  showActions = false,
  isFavorite = false,
  loading = false,
  onToggleFavorite,
  actionsMenu,
  searchArea,
  patientCard,
  goBackButton
}) => {
  return (
    <Grid
      container
      direction="column"
      alignItems="center"
      justifyContent="center"
      sx={{ backgroundColor: '#E6F1FD', padding: '20px 0' }}
    >
      <Grid container xs={11} direction="column" justifyContent="center" gap={1}>
        {loading ? (
          <>
            <Skeleton width={200} />
            <Skeleton width={100} />
          </>
        ) : (
          <>
            {goBackButton}
            <Grid container justifyContent="space-between" alignItems="center">
              <Box display="flex" alignItems="center" gap={1}>
                {icon}
                <Typography id="cohort-name" variant="h1">
                  {title}
                </Typography>
                {showActions && onToggleFavorite && (
                  <IconButton onClick={onToggleFavorite} color="secondary">
                    <FavStar favorite={isFavorite} height={20} />
                  </IconButton>
                )}
              </Box>

              <Box display="flex" alignItems="center" gap={1}>
                {accessLevel && <AccessBadge accessLevel={accessLevel} loading={loading} />}
                {actionsMenu}
              </Box>
            </Grid>

            {description && (
              <Tooltip title={description}>
                <Typography id="cohort-description" noWrap style={{ width: '100%' }} variant="subtitle2">
                  {description}
                </Typography>
              </Tooltip>
            )}

            {perimeters.length > 0 && <ExpandableChipsLine items={perimeters} />}
          </>
        )}

        <Grid container alignItems="center" gap={3}>
          {patientsCount !== undefined && (
            <CohortInfo label="Nb de patients" total={format(patientsCount)} loading={loading} />
          )}
          {cohortId && <CohortInfo label="ID cohorte" total={cohortId} loading={loading} />}
        </Grid>
        {searchArea}
        {patientCard}
      </Grid>
    </Grid>
  )
}

export default HeaderLayout
