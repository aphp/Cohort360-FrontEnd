import React from 'react'

import { Box, CircularProgress, Grid, Typography } from '@mui/material'
import Button from 'components/ui/Button'
import Chip from 'components/ui/Chip'

import AddIcon from '@mui/icons-material/Add'
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline'
import FilterList from '@mui/icons-material/FilterList'
import { FilterKeys, FilterValue } from 'types/searchCriterias'

type ActionBarProps = {
  deleteMode: boolean
  loading: boolean
  total: number
  label: string
  totalSelected: number
  onConfirmDeletion: () => void
  onCancelDeletion: () => void
  onFilter?: () => void
  filters?: { value: FilterValue; category: FilterKeys; label: string }[]
}

const ActionBar: React.FC<ActionBarProps> = ({
  deleteMode,
  loading,
  total,
  label,
  totalSelected,
  onCancelDeletion,
  onConfirmDeletion,
  onFilter,
  filters
}) => {
  return (
    <Grid container justifyContent={'space-between'} alignItems={'center'}>
      {!deleteMode &&
        (loading ? (
          <CircularProgress size={20} />
        ) : (
          <Typography fontWeight={'bold'} fontSize={14}>
            {total} {label}
            {total > 1 ? 's' : ''}
          </Typography>
        ))}
      {!deleteMode && onFilter && (
        <Button startIcon={<FilterList height="15px" fill="#FFF" />} width={'fit-content'} onClick={onFilter}>
          Filtrer
        </Button>
      )}
      {!deleteMode && (
        <Button width="fit-content" onClick={() => console.log('euh a faire')} endIcon={<AddIcon />}>
          Ajouter une requête
        </Button>
      )}
      {!deleteMode && filters && (
        <Grid item xs={12}>
          {filters.map((filter, index) => (
            <Chip key={index} label={filter.label} onDelete={() => removeFilter(filter.category, filter.value)} />
          ))}
        </Grid>
      )}
      {/* TODO: faire un map sur les boutons sinon, avec une box autour */}

      {deleteMode && (
        <>
          <Typography fontWeight={'bold'} fontSize={14}>
            {totalSelected} {label}
            {totalSelected > 1 ? 's' : ''} sélectionnée
            {totalSelected > 1 ? 's' : ''}
          </Typography>
          <Box display={'flex'} justifyContent={'flex-end'}>
            {/* TODO: a custom */}
            <Button onClick={onCancelDeletion} clearVariant>
              Annuler la suppression
            </Button>
            <Button
              onClick={onConfirmDeletion}
              clearVariant
              endIcon={<DeleteOutlineIcon color={totalSelected === 0 ? 'disabled' : 'secondary'} />}
              disabled={totalSelected === 0}
            >
              Supprimer
            </Button>
          </Box>
        </>
      )}
    </Grid>
  )
}

export default ActionBar
