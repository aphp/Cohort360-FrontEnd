import React, { useState } from 'react'
import { Button } from '@mui/material'
import List from 'components/ui/List'
import Modal from 'components/ui/Modal'
import Text from 'components/ui/Inputs/Text'
import { Item } from 'components/ui/List/ListItem'
import { SavedSearch } from '@mui/icons-material'

type SavedFiltersProps<T> = {
  criterias: Item[]
  count: number
  disabled?: boolean
  onNext: () => void
  onSubmit: () => void
  onDelete: (ids: string[]) => void
  onSelect: (id: string) => void
  onDisplay: (readonly: boolean) => void
}

const SavedFilters = <T,>({
  count,
  criterias,
  disabled = false,
  onDisplay,
  onNext,
  onSelect,
  onSubmit,
  onDelete
}: SavedFiltersProps<T>) => {
  const [toggleModal, setToggleModal] = useState(false)

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
        onSubmit={() => {
          onSubmit()
          setToggleModal(false)
        }}
        //  isError={!selectedSavedFilter}
        submitText="Appliquer le filtre"
      >
        <List
          values={criterias}
          count={count}
          onDisplay={() => onDisplay(true)}
          onEdit={disabled ? undefined : () => onDisplay(false)}
          onDelete={disabled ? undefined : onDelete}
          onSelect={(id) => onSelect(id)}
          fetchPaginateData={onNext}
        />
      </Modal>
    </>
  )
}

export default SavedFilters
