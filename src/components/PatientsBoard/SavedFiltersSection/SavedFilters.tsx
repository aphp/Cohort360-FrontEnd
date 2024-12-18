import React, { useEffect, useMemo, useState } from 'react'
import { Button, Grid, Typography } from '@mui/material'
import List from 'components/ui/List'
import Modal from 'components/ui/Modal'
import { Item } from 'components/ui/List/ListItem'
import { DeleteOutline, Edit, SavedSearch, Visibility } from '@mui/icons-material'
import { SelectedFilter } from 'hooks/filters/useSavedFilters'
import { Filters, SearchCriterias } from 'types/searchCriterias'
import EditSavedFilter, { DynamicSelectedFilter } from './EditSavedFilter'

type SavedFiltersProps = {
  deidentified: boolean
  selectedFilter: SelectedFilter<Filters> | null
  criterias: Item[]
  count: number
  disabled?: boolean
  onNext: () => void
  onSubmit: () => void
  onDelete: (ids: string[]) => void
  onSelect: (id: string) => void
  onEdit: (name: string, newSearchCriterias: SearchCriterias<Filters>, deidentified: boolean) => void
}

const SavedFilters = ({
  deidentified,
  count,
  criterias,
  disabled = false,
  selectedFilter,
  onNext,
  onSelect,
  onSubmit,
  onDelete,
  onEdit
}: SavedFiltersProps) => {
  const [toggleModal, setToggleModal] = useState(false)
  const [toggleDeleteModal, setToggleDeleteModal] = useState(false)
  const [toggleDisplayModal, setToggleDisplayModal] = useState(false)
  const [selectedItems, setSelectedItems] = useState<string[]>([])

  useEffect(() => {
    if (selectedItems.length === 1) onSelect(selectedItems[0])
  }, [selectedItems])

  return (
    <>
      <Button
        sx={{ borderRadius: 25 }}
        size="small"
        variant="contained"
        fullWidth
        startIcon={<SavedSearch height="15px" fill="#FFF" />}
        onClick={() => setToggleModal(true)}
        color="primary"
        disabled={disabled}
      >
        Vos filtres
      </Button>
      <Modal
        title="Filtres sauvegardés"
        open={toggleModal}
        onClose={() => {
          setToggleModal(false)
          // resetSavedFilterError()
        }}
        isError={selectedItems.length !== 1}
        onSubmit={() => {
          onSubmit()
          setToggleModal(false)
        }}
        submitText="Appliquer le filtre"
      >
        <Grid container item xs={12} alignItems="center" gap={1}>
          <Grid item xs={3}>
            <Button
              sx={{ borderRadius: 25 }}
              fullWidth
              size="small"
              variant="contained"
              color="info"
              startIcon={<Visibility />}
              onClick={() => setToggleDisplayModal(true)}
              disabled={selectedItems.length !== 1}
            >
              Voir
            </Button>
          </Grid>
          <Grid item xs={1}>
            <Button
              color="warning"
              size="small"
              variant="contained"
              sx={{ borderRadius: 25 }}
              onClick={() => setToggleDeleteModal(true)}
              disabled={disabled || !selectedItems.length}
            >
              <DeleteOutline />
            </Button>
          </Grid>
        </Grid>
        <List values={criterias} count={count} onSelect={setSelectedItems} fetchPaginateData={onNext} />
      </Modal>

      <Modal
        width="250px"
        open={toggleDeleteModal}
        onClose={() => setToggleDeleteModal(false)}
        onSubmit={() => onDelete(selectedItems)}
      >
        <Typography sx={{ color: '#00000099' }} fontWeight={600} fontSize={14}>
          Êtes-vous sur de vouloir supprimer les éléments sélectionnés ?
        </Typography>
      </Modal>

      {selectedFilter && (
        <EditSavedFilter
          open={toggleDisplayModal}
          readonly={disabled}
          criteria={selectedFilter! as DynamicSelectedFilter}
          onEdit={(name, filters, deidentified) => {
            onEdit(name, filters, deidentified)
            setToggleDisplayModal(false)
          }}
          onClose={() => setToggleDisplayModal(false)}
          deidentified={deidentified}
        />
      )}
    </>
  )
}

export default SavedFilters
