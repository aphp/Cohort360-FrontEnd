import React from 'react'

import { Box, CircularProgress, Grid, Typography } from '@mui/material'
import Button from 'components/ui/Button'

import AddIcon from '@mui/icons-material/Add'
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline'
import FilterList from '@mui/icons-material/FilterList'

type ActionBarProps = {
  deleteMode: boolean
  loading: boolean
  total: number
  label: string
  totalSelected: number
  onConfirmDeletion: () => void
  onCancelDeletion: () => void
  filters?: boolean
}

const ActionBar: React.FC<ActionBarProps> = ({
  deleteMode,
  loading,
  total,
  label,
  totalSelected,
  onCancelDeletion,
  onConfirmDeletion,
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
      {!deleteMode && filters && (
        <Button
          startIcon={<FilterList height="15px" fill="#FFF" />}
          width={'fit-content'}
          onClick={() => setToggleFilterByModal(true)}
        >
          Filtrer
        </Button>
      )}
      {!deleteMode && (
        <Button width="fit-content" onClick={() => console.log('euh a faire')} endIcon={<AddIcon />}>
          Ajouter une requête
        </Button>
      )}
      {/* {!deleteMode && 
        {filtersAsArray.length > 0 && (
          <Grid item xs={12}>
            {filtersAsArray.map((filter, index) => (
              <Chip key={index} label={filter.label} onDelete={() => removeFilter(filter.category, filter.value)} />
            ))}
          </Grid>
        )}
      } */}

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
