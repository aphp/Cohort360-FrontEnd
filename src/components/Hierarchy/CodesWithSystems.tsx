import { Chip, Grid, SxProps, Theme, Typography } from '@mui/material'
import React, { useMemo } from 'react'
import { Hierarchy } from 'types/hierarchy'
import { groupBySystem } from 'utils/hierarchy'
import { getLabelFromCode, getLabelFromSystem, isDisplayedWithSystem } from 'utils/valueSets'

type CodesWithSystemsProps<T> = {
  codes: Hierarchy<T>[]
  disabled?: boolean
  isExtended?: boolean
  onDelete: (node: Hierarchy<T>) => void
  sx?: SxProps<Theme>
}

const CodesWithSystems = <T,>({
  codes,
  disabled = false,
  isExtended = true,
  onDelete,
  sx
}: CodesWithSystemsProps<T>) => {
  const groupedBySystem = useMemo(() => groupBySystem(codes), [codes])

  const ChipGroup = ({ codes }: { codes: Hierarchy<T>[] }) => (
    <>
      {codes.map((code) => (
        <Chip
          disabled={disabled}
          key={code.id}
          label={getLabelFromCode(code)}
          sx={{
            ...sx,
            marginBottom: '2px',
            marginRight: '2px'
          }}
          onDelete={() => onDelete(code)}
        />
      ))}
    </>
  )

  return (
    <>
      {codes.length > 0 && isExtended && (
        <Grid container alignItems="center" overflow="hidden">
          {groupedBySystem.map((group) => (
            <Grid item xs={12} key={group.system}>
              {isDisplayedWithSystem(group.system) && (
                <Typography fontWeight="700" marginRight="5px" padding={'8px 0'}>
                  {`${getLabelFromSystem(group.system)} (${group.codes.length})`}
                </Typography>
              )}
              <ChipGroup codes={group.codes} />
            </Grid>
          ))}
        </Grid>
      )}
      {codes.length > 0 && !isExtended && (
        <div style={{ display: 'flex', alignItems: 'center', overflow: 'hidden' }}>
          <ChipGroup codes={codes} />
        </div>
      )}
    </>
  )
}

export default CodesWithSystems
