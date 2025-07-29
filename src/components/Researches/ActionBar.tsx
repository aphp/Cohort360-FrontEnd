import React from 'react'

import { CircularProgress, Grid } from '@mui/material'

import AddIcon from '@mui/icons-material/Add'
import Button from 'components/ui/Button'
import CriteriasSection from 'components/ExplorationBoard/CriteriasSection'
import DeleteIcon from 'assets/icones/delete.svg?react'
import DisplayDigits from 'components/ui/Display/DisplayDigits'
import DriveFileMoveIcon from 'assets/icones/drive-file-move.svg?react'
import FilterList from '@mui/icons-material/FilterList'

import { FilterKeys, FilterValue, SearchCriteriaKeys } from 'types/searchCriterias'
import { useSizeObserver } from 'hooks/ui/useSizeObserver'

type ActionBarProps = {
  loading: boolean
  total: number
  label: 'requête' | 'cohorte' | 'échantillon'
  totalSelected: number
  onDelete: () => void
  onMove?: () => void
  onFilter?: () => void
  filters?: { value: FilterValue; category: FilterKeys | SearchCriteriaKeys; label: string }[]
  onRemoveFilters?: (key: FilterKeys | SearchCriteriaKeys, value: FilterValue) => void
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
  const {
    ref,
    sizes: { isMD, isLG, isXL }
  } = useSizeObserver()

  return (
    <Grid container size={12} sx={{ justifyContent: 'space-between', alignItems: 'center', gap: 2 }} mt={1}>
      <Grid container size={12} sx={{ justifyContent: 'space-between' }} ref={ref}>
        <Grid container size={{ xs: 12, md: 8 }} sx={{ gap: '4px' }}>
          {onFilter && (
            <Button
              onClick={onFilter}
              disabled={disabled}
              startIcon={<FilterList height="15px" fill="#FFF" />}
              width="fit-content"
            >
              Filtrer
            </Button>
          )}
          {onAddRequest && (
            <Button width="fit-content" onClick={() => onAddRequest()} endIcon={<AddIcon />} disabled={disabled}>
              Nouvelle requête
            </Button>
          )}
          {onAddSample && (
            <Button width="fit-content" onClick={() => onAddSample()} endIcon={<AddIcon />} disabled={disabled}>
              Nouvel échantillon
            </Button>
          )}
          {totalSelected > 0 && (
            <>
              {onMove && (
                <Button
                  width="fit-content"
                  onClick={() => (onMove ? onMove() : null)}
                  endIcon={<DriveFileMoveIcon />}
                  disabled={disabled}
                >
                  Déplacer
                </Button>
              )}
              <Button
                width="fit-content"
                onClick={onDelete}
                endIcon={<DeleteIcon />}
                customVariant="pink"
                disabled={disabled}
              >
                Supprimer
              </Button>
            </>
          )}
        </Grid>
        <Grid container sx={{ alignItems: 'center' }} size={{ xs: 12, lg: 4 }}>
          <Grid
            container
            size={12}
            sx={{ alignItems: 'center', gap: 1, justifyContent: isMD || isLG || isXL ? 'flex-end' : 'center' }}
            mt={isMD || isLG || isXL ? 0 : '12px'}
          >
            {totalSelected > 0 && (
              <DisplayDigits
                nb={totalSelected}
                label={`${label}${totalSelected > 1 ? 's' : ''} sélectionné${label !== 'échantillon' ? 'e' : ''}${
                  totalSelected > 1 ? 's' : ''
                } /`}
              />
            )}
            {loading ? (
              <CircularProgress size={20} />
            ) : (
              <DisplayDigits nb={total} label={`${label}${total > 1 ? 's' : ''}`} />
            )}
          </Grid>
        </Grid>
      </Grid>
      {filters && onRemoveFilters && (
        <CriteriasSection
          value={filters}
          displayOptions={{
            myFilters: false,
            filterBy: true,
            orderBy: false,
            saveFilters: false,
            criterias: true,
            search: false,
            diagrams: false,
            count: false,
            sidebar: false
          }}
          onDelete={onRemoveFilters}
        />
      )}
    </Grid>
  )
}

export default ActionBar
