import { Chip, SxProps, Theme, Typography } from '@mui/material'
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
  const groupedBySystem = useMemo(
    () => (isExtended ? groupBySystem(codes) : [{ system: 'ALL', codes }]),
    [codes, isExtended]
  )
  return (
    <>
      {codes.length > 0 &&
        groupedBySystem.map((group) => (
          <div
            key={group.system}
            style={{ display: isExtended ? 'block' : 'flex', alignItems: 'center', overflow: 'hidden' }}
          >
            {isExtended && isDisplayedWithSystem(group.system) && (
              <Typography fontWeight="700" marginRight="5px" padding={'8px 0'}>
                {`${getLabelFromSystem(group.system)} (${group.codes.length})`}
              </Typography>
            )}
            {group.codes.map((code) => (
              <Chip
                disabled={disabled}
                key={code.id}
                label={getLabelFromCode(code)}
                sx={{ ...sx, marginBottom: '2px', marginRight: '2px' }}
                onDelete={() => onDelete(code)}
              />
            ))}
          </div>
        ))}
    </>
  )
}

export default CodesWithSystems
