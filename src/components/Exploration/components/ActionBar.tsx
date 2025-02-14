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
  moveMode?: boolean
  deleteMode: boolean
  loading: boolean
  total: number
  label: string
  totalSelected: number
  onConfirmDeletion: () => void
  onCancelMultiselectMode: () => void
  onMove?: () => void
  onFilter?: () => void
  filters?: { value: FilterValue; category: FilterKeys; label: string }[]
  onRemoveFilters?: (key: FilterKeys, value: FilterValue) => void
}

const ActionBar: React.FC<ActionBarProps> = ({
  moveMode,
  deleteMode,
  loading,
  total,
  label,
  totalSelected,
  onCancelMultiselectMode,
  onConfirmDeletion,
  onMove,
  onFilter,
  filters,
  onRemoveFilters
}) => {
  const multiselectMode = deleteMode || moveMode

  return (
    <Grid container justifyContent={'space-between'} alignItems={'center'}>
      {!multiselectMode &&
        (loading ? (
          <CircularProgress size={20} />
        ) : (
          <Typography fontWeight={'bold'} fontSize={14}>
            {total} {label}
            {total > 1 ? 's' : ''}
          </Typography>
        ))}
      {!multiselectMode && onFilter && (
        <Button startIcon={<FilterList height="15px" fill="#FFF" />} width={'fit-content'} onClick={onFilter}>
          Filtrer
        </Button>
      )}
      {!multiselectMode && (
        <Button width="fit-content" onClick={() => console.log('euh a faire')} endIcon={<AddIcon />}>
          Ajouter une requête
        </Button>
      )}
      {!multiselectMode && filters && (
        <Grid item xs={12}>
          {filters.map((filter, index) => {
            console.log('test filter', filter)
            return (
              <Chip
                key={index}
                label={filter.label}
                onDelete={() => {
                  console.log('whatsgapenning')
                  onRemoveFilters && onRemoveFilters(filter.category, filter.value)
                }}
              />
            )
          })}
        </Grid>
      )}
      {/* TODO: faire un map sur les boutons sinon, avec une box autour */}

      {multiselectMode && (
        <>
          <Typography fontWeight={'bold'} fontSize={14}>
            {totalSelected} {label}
            {totalSelected > 1 ? 's' : ''} sélectionnée
            {totalSelected > 1 ? 's' : ''}
          </Typography>
          <Box display={'flex'} justifyContent={'flex-end'}>
            {moveMode && (
              <>
                <Button onClick={onCancelMultiselectMode} clearVariant>
                  {/* TODO: a custom */}
                  Annuler
                </Button>
                <Button
                  onClick={() => (onMove ? onMove() : null)}
                  clearVariant
                  endIcon={<DriveFileMoveIcon color={totalSelected === 0 ? 'disabled' : 'secondary'} />}
                  disabled={totalSelected === 0}
                >
                  Déplacer
                </Button>
              </>
            )}
            {deleteMode && (
              <>
                <Button onClick={onCancelMultiselectMode} clearVariant>
                  {/* TODO: a custom */}
                  Annuler la suppression
                </Button>
                <Button
                  onClick={onConfirmDeletion}
                  clearVariant
                  endIcon={<DeleteIcon color={totalSelected === 0 ? 'disabled' : 'secondary'} />}
                  disabled={totalSelected === 0}
                >
                  Supprimer
                </Button>
              </>
            )}
          </Box>
        </>
      )}
    </Grid>
  )
}

export default ActionBar
