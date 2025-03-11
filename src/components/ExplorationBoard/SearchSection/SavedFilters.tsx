import React, { useEffect, useMemo, useState } from 'react'
import { Button, Grid, Tooltip, Typography } from '@mui/material'
import List from 'components/ui/List'
import Modal from 'components/ui/Modal'
import { DeleteOutline, SavedSearch, Visibility } from '@mui/icons-material'
import { SelectedFilter } from 'hooks/filters/useSavedFilters'
import { Filters, SavedFiltersResults, SearchCriterias } from 'types/searchCriterias'
import EditSavedFilter from './EditSavedFilter'
import { useAppSelector } from 'state'
import { AdditionalInfo } from 'types/exploration'

type SavedFiltersProps = {
  selectedFilter: SelectedFilter<Filters> | null
  infos: AdditionalInfo
  allFilters: SavedFiltersResults | null
  disabled?: boolean
  onNext: () => void
  onSubmit: (criteria: SearchCriterias<Filters>) => void
  onDelete: (ids: string[]) => void
  onSelect: (id: string) => void
  onEdit: (name: string, newSearchCriterias: SearchCriterias<Filters>) => void
}

const SavedFilters = ({
  allFilters,
  infos,
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
  const maintenanceIsActive = useAppSelector((state) => state.me)?.maintenance?.active

  const asListItems = useMemo(
    () =>
      allFilters?.results.map((elem) => {
        return { id: elem.uuid, name: elem.name, checked: false }
      }) || [],
    [allFilters]
  )

  useEffect(() => {
    if (selectedItems.length === 1) onSelect(selectedItems[0])
  }, [selectedItems])
  return (
    <>
      <Button
        sx={{ borderRadius: 1 }}
        size="small"
        variant="contained"
        fullWidth
        startIcon={<SavedSearch height="15px" />}
        onClick={() => setToggleModal(true)}
        style={{ backgroundColor: '#fff', color: '#303030', height: '30px' }}
      >
        Mes filtres
      </Button>
      <Modal
        title="Filtres sauvegardés"
        open={toggleModal}
        onClose={() => {
          setToggleModal(false)
        }}
        isError={selectedItems.length !== 1}
        onSubmit={() => {
          if (selectedFilter) onSubmit(selectedFilter.filterParams)
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
          <Tooltip title={maintenanceIsActive ? "Ce bouton est desactivé en raison d'une maintenance." : undefined}>
            <Grid item xs={1}>
              <Button
                color="warning"
                size="small"
                variant="contained"
                style={
                  maintenanceIsActive
                    ? { borderRadius: 25, cursor: 'not-allowed', pointerEvents: 'auto' }
                    : { borderRadius: 25 }
                }
                onClick={() => setToggleDeleteModal(true)}
                disabled={!selectedItems.length || maintenanceIsActive}
              >
                <DeleteOutline />
              </Button>
            </Grid>
          </Tooltip>
        </Grid>
        <List
          values={asListItems}
          count={allFilters?.count ?? 0}
          onSelect={setSelectedItems}
          fetchPaginateData={onNext}
        />
      </Modal>

      <Modal
        width="250px"
        open={toggleDeleteModal}
        onClose={() => setToggleDeleteModal(false)}
        onSubmit={() => {
          onDelete(selectedItems)
          setToggleDeleteModal(false)
        }}
      >
        <Typography sx={{ color: '#00000099' }} fontWeight={600} fontSize={14}>
          Êtes-vous sur de vouloir supprimer les éléments sélectionnés ?
        </Typography>
      </Modal>

      {selectedFilter && (
        <EditSavedFilter
          infos={infos}
          open={toggleDisplayModal}
          criteria={selectedFilter!}
          onEdit={(name, filters) => {
            onEdit(name, filters)
            setToggleDisplayModal(false)
          }}
          onClose={() => setToggleDisplayModal(false)}
        />
      )}
    </>
  )
}

export default SavedFilters
