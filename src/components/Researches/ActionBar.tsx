import React from 'react'

import { Box, CircularProgress, Grid, Typography } from '@mui/material'
import Button from 'components/ui/Button'
import Chip from 'components/ui/Chip'

import AddIcon from '@mui/icons-material/Add'
import DeleteIcon from 'assets/icones/delete.svg?react'
import DriveFileMoveIcon from 'assets/icones/drive-file-move.svg?react'
import FilterList from '@mui/icons-material/FilterList'

import { FilterKeys, FilterValue } from 'types/searchCriterias'

type ActionBarProps = {
  loading: boolean
  total: number
  label: 'requête' | 'cohorte' | 'échantillon'
  totalSelected: number
  onDelete: () => void
  onMove?: () => void
  onFilter?: () => void
  filters?: { value: FilterValue; category: FilterKeys; label: string }[]
  onRemoveFilters?: (key: FilterKeys, value: FilterValue) => void
  onAddRequest?: () => void
  onAddSample?: () => void
  disabled?: boolean
}

const ActionBar: React.FC<ActionBarProps> = ({
  loading,
  total,
  label,
  totalSelected,
  onDelete,
  onMove,
  onFilter,
  filters,
  onRemoveFilters,
  onAddRequest,
  onAddSample,
  disabled = false
}) => {
  return (
    <Grid container justifyContent={'space-between'} alignItems={'center'}>
      <Box display={'flex'} gap={1}>
        {totalSelected > 0 && (
          <Typography fontWeight={'bold'} fontSize={13}>
            {totalSelected} {label}
            {totalSelected > 1 ? 's' : ''} sélectionné{label !== 'échantillon' && 'e'}
            {totalSelected > 1 ? 's' : ''} /
          </Typography>
        )}
        {loading ? (
          <CircularProgress size={20} />
        ) : (
          <Typography fontWeight={'bold'} fontSize={13}>
            {total} {label}
            {total > 1 ? 's' : ''}
          </Typography>
        )}
      </Box>
      <Box display="flex" gap={1}>
        {onFilter && (
          <Button endIcon={<FilterList />} width={'fit-content'} onClick={onFilter} small>
            Filtrer
          </Button>
        )}
        {onAddRequest && (
          <Button width="fit-content" onClick={() => onAddRequest()} endIcon={<AddIcon />} disabled={disabled} small>
            Nouvelle requête
          </Button>
        )}
        {onAddSample && (
          <Button width="fit-content" onClick={() => onAddSample()} endIcon={<AddIcon />} disabled={disabled} small>
            Nouvel échantillon
          </Button>
        )}
        {totalSelected > 0 && (
          <>
            {onMove && (
              <Button
                width="fit-content"
                small
                onClick={() => (onMove ? onMove() : null)}
                endIcon={<DriveFileMoveIcon />}
                disabled={disabled}
              >
                Déplacer
              </Button>
            )}
            <Button
              width="fit-content"
              small
              onClick={onDelete}
              endIcon={<DeleteIcon />}
              customVariant="pink"
              disabled={disabled}
            >
              Supprimer
            </Button>
          </>
        )}
      </Box>
      {filters && (
        <Grid container xs={12} marginTop={'8px'}>
          {filters.map((filter, index) => {
            return (
              <Chip
                key={index}
                label={filter.label}
                onDelete={() => {
                  onRemoveFilters && onRemoveFilters(filter.category, filter.value)
                }}
                style={{ backgroundColor: '#f7f7f7' }}
              />
            )
          })}
        </Grid>
      )}
    </Grid>
  )
}

export default ActionBar
