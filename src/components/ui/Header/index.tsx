import React from 'react'

import { Box, Grid, Skeleton, Tooltip, Typography } from '@mui/material'

import AccessBadge, { AccessLevel } from 'components/ui/AccessBadge'
import CohortInfo from 'components/ui/CohortInfo'
import ExpandableChipsLine from 'components/ui/ExpandableChips'

import { format } from 'utils/numbers'

type HeaderLayoutProps = {
  id?: string
  title: string
  titleOnly?: boolean
  description?: string
  cohortId?: string
  patientsCount?: number
  perimeters?: string[]
  accessLevel?: AccessLevel
  loading?: boolean
  lastConnexion?: string
  favStar?: React.ReactNode
  editRequest?: React.ReactNode
  actionsMenu?: React.ReactNode
  searchArea?: React.ReactNode
  patientCard?: React.ReactNode
  goBackButton?: React.ReactNode
}

const HeaderLayout: React.FC<HeaderLayoutProps> = ({
  id,
  title,
  favStar,
  editRequest,
  titleOnly = false,
  description,
  cohortId,
  patientsCount,
  perimeters = [],
  accessLevel,
  loading = false,
  lastConnexion = '',
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
      sx={{ backgroundColor: '#E6F1FD', padding: '20px 0 16px' }}
    >
      <Grid container xs={11} direction="column" justifyContent="center" gap={lastConnexion ? '4px' : 2}>
        {loading ? (
          <>
            <Skeleton width={200} />
            <Skeleton width={100} />
          </>
        ) : (
          <>
            {goBackButton}
            <Grid container justifyContent="space-between" alignItems="center">
              <Box display="flex" alignItems="center" gap={1} padding={titleOnly ? '16px 0 32px' : 0}>
                <Typography id={id ?? title} variant="h1">
                  {title}
                </Typography>
                {favStar}
              </Box>

              <Box display="flex" alignItems="center" gap={1}>
                {editRequest}
                {accessLevel && <AccessBadge accessLevel={accessLevel} loading={loading} />}
                {actionsMenu}
              </Box>
            </Grid>
            {lastConnexion && (
              <Typography id="last-connection" component="h6" variant="h6" noWrap>
                {lastConnexion}
              </Typography>
            )}

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

        {(patientsCount !== undefined || cohortId) && (
          <Grid container alignItems="center" gap={3}>
            {patientsCount !== undefined && (
              <CohortInfo label="Nb de patients" total={format(patientsCount)} loading={loading} />
            )}
            {cohortId && <CohortInfo label="ID cohorte" total={cohortId} loading={loading} />}
          </Grid>
        )}
        {searchArea}
        {patientCard}
      </Grid>
    </Grid>
  )
}

export default HeaderLayout
