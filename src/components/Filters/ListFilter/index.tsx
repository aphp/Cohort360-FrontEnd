import React, { PropsWithChildren, useContext, useEffect, useState } from 'react'
import { FormContext } from 'components/ui/Modal'
import { SavedFilter } from 'types/searchCriterias'
import Button from 'components/ui/Button'
import { DeleteOutline } from '@mui/icons-material'
import { Grid, Typography } from '@mui/material'
import { useAppSelector } from 'state'
import { MeState } from 'state/me'
import { Item } from 'components/ui/List/ListItem'
import List from 'components/ui/List'

enum Mode {
  SINGLE,
  MULTIPLE
}

type ListFilterProps = {
  name?: string
  values: SavedFilter[]
  count: number
  onDelete: (value: any) => void
  onSelect: (filter: SavedFilter) => void
  onDisplay: () => void
  onEdit: () => void
  fetchPaginateData: () => void
}

const ListFilter = ({
  children,
  name,
  values,
  count,
  onDelete,
  onSelect,
  onDisplay,
  onEdit,
  fetchPaginateData
}: PropsWithChildren<ListFilterProps>) => {
  const context = useContext(FormContext)
  const [allElements, setAllElements] = useState<Item[]>([])
  const [mode, setMode] = useState(Mode.SINGLE)

  const { meState } = useAppSelector<{ meState: MeState }>((state) => ({ meState: state.me }))
  const maintenanceIsActive = meState?.maintenance?.active

  const handleDeleteSelectedElements = async (): Promise<void> => {
    const elementsIdsToDelete = allElements.filter((elem) => elem.checked).map((elem) => elem.id)
    onDelete(elementsIdsToDelete)
  }

  useEffect(() => {
    context?.updateError(false)
    if (context?.updateError && mode === Mode.MULTIPLE) {
      context.updateError(true)
    }
    setAllElements(allElements.map((value) => ({ ...value, checked: false })))
  }, [mode])

  useEffect(() => {
    setAllElements(
      values.map((value) => ({
        id: value.uuid,
        name: value.name,
        checked: allElements.find((elem) => elem.id === value.uuid)?.checked || false
      }))
    )
  }, [values])

  useEffect(() => {
    context?.updateError(false)
    const selectedItem = values.find((elem) => elem.uuid === allElements.find((elem) => elem.checked)?.id)
    if (name && selectedItem) context?.updateFormData(name, selectedItem)
    if (!selectedItem || mode === Mode.MULTIPLE) context?.updateError(true)
    if (selectedItem) onSelect(selectedItem)
  }, [allElements])

  return (
    <>
      {mode === Mode.SINGLE && (
        <Grid container item xs={4} margin="0px 0px 20px 0px">
          <Button
            icon={<DeleteOutline />}
            color="primary"
            onClick={() => setMode(Mode.MULTIPLE)}
            disabled={maintenanceIsActive}
          >
            Supprimer
          </Button>
        </Grid>
      )}
      {mode === Mode.MULTIPLE && (
        <Grid container justifyContent="space-between" item xs={8} margin="0px 0px 20px 0px">
          <Button
            width="60%"
            icon={<DeleteOutline />}
            color="error"
            onClick={() => {
              handleDeleteSelectedElements()
              setMode(Mode.SINGLE)
            }}
            disabled={!allElements.find((elem) => elem.checked)}
          >
            Confirmer
          </Button>
          <Button variant="text" color="error" width="40%" onClick={() => setMode(Mode.SINGLE)}>
            <Typography fontWeight="700">Annuler</Typography>
          </Button>
        </Grid>
      )}
      {Boolean(allElements.length) ? (
        <List
          values={allElements}
          multiple={mode === Mode.MULTIPLE}
          count={count}
          onchange={(newItems) => setAllElements(newItems)}
          onItemEyeClick={onDisplay}
          onItemPencilClick={onEdit}
          fetchPaginateData={fetchPaginateData}
        />
      ) : (
        <Typography fontWeight="700" align="center" sx={{ padding: '8px' }}>
          Aucun élément n'a été enregistré
        </Typography>
      )}

      {children}
    </>
  )
}

export default ListFilter
