import React, { Fragment, ReactElement, useContext, useEffect, useRef, useState } from 'react'
import Modal, { FormContext } from 'components/ui/Modal'
import Button from 'components/ui/Button'
import { DeleteOutline, Edit, Visibility } from '@mui/icons-material'
import { Checkbox, FormControlLabel, Grid, ListItemIcon, Typography, List as ListMui } from '@mui/material'
import ListItem from 'components/ui/List/ListItem'
import { ListItemWrapper } from './styles'
import InfiniteScroll from 'react-infinite-scroll-component'
import { v4 as uuidv4 } from 'uuid'

const ELEMS_TO_RENDER_STEP = 10

type id = string

export enum ListType {
  SINGLE,
  MULTIPLE
}

type ListProps = {
  allElements: ReactElement<typeof ListItem>[]
  count: number
  type: ListType
  selectedIds: Map<string, true>
  onSelect: (value: id[] | id) => void
  onDisplay?: () => void
  onEdit?: () => void
  onDelete?: (value: id[]) => void
  onSelectAll?: () => void
  fetchPaginateData: () => void
}

const List = ({
  count,
  allElements,
  type,
  selectedIds,
  onDelete,
  onSelect,
  onDisplay,
  onEdit,
  onSelectAll,
  fetchPaginateData
}: ListProps) => {
  const context = useContext(FormContext)
  const [elemsToRenderLimit, setElemsToRenderLimit] = useState(ELEMS_TO_RENDER_STEP)
  const [fetchMore, setFetchMore] = useState(false)
  const [toggleDeleteModal, setToggleDeleteModal] = useState(false)
  const [toggleSelectAll, setToggleSelectAll] = useState(false)
  const scrollableUuid = useRef(uuidv4())

  const handleCheck = (id: string) => {
    if (type === ListType.SINGLE && !selectedIds.size) {
      onSelect(id)
    } else if (type === ListType.MULTIPLE) {
      onSelect([id])
    }
  }

  const handleFetchNext = () => {
    const newLimit = elemsToRenderLimit + ELEMS_TO_RENDER_STEP
    setElemsToRenderLimit(newLimit)
    if (elemsToRenderLimit >= allElements.length) {
      fetchPaginateData()
      setFetchMore(true)
    }
  }

  /*useEffect(() => {
    const boolValue = toggleSelectAll
    const selected = allElements.map((elem) => elem.props.id)
    if (type === ListType.SINGLE && selected.length === 1) {
      onSelect(selected[0])
    } else if (type === ListType.MULTIPLE) {
      onSelect(selected)
    }
  }, [toggleSelectAll])*/

  useEffect(() => {
    context?.updateError(true)
    if (type === ListType.SINGLE && selectedIds.size < 2) {
      context?.updateError(false)
    } else if (type === ListType.MULTIPLE) {
      context?.updateError(false)
    }
  }, [selectedIds])

  useEffect(() => {
    if (!fetchMore) {
      setElemsToRenderLimit(ELEMS_TO_RENDER_STEP)
    }
    setFetchMore(false)
  }, [allElements])

  return (
    <Grid container>
      {(onDisplay || onEdit || onDelete) && (
        <Grid container item xs={12} alignItems="center" gap={1} marginBottom={4}>
          {onDisplay && (
            <Grid item xs={3}>
              <Button color="info" icon={<Visibility />} onClick={onDisplay} disabled={selectedIds.size !== 1}>
                Voir
              </Button>
            </Grid>
          )}
          {onEdit && (
            <Grid item xs={4}>
              <Button color="info" icon={<Edit />} onClick={onEdit} disabled={selectedIds.size !== 1}>
                Modifier
              </Button>
            </Grid>
          )}
          {onDelete && (
            <Grid item xs={1}>
              <Button
                color="warning"
                onClick={() => {
                  setToggleDeleteModal(true)
                  context?.updateError(true)
                }}
                disabled={selectedIds.size < 1}
              >
                <DeleteOutline />
              </Button>
            </Grid>
          )}
        </Grid>
      )}
      <Grid container>
        {allElements.length > 0 ? (
          <Grid item xs={12}>
            <FormControlLabel
              labelPlacement="end"
              color="warning"
              style={{ margin: 0 }}
              control={<Checkbox color="info" onChange={() => setToggleSelectAll(!toggleSelectAll)} />}
              label={
                <Typography fontSize="14" fontWeight={800} textTransform="uppercase" color="#0288d1">
                  Tout {toggleSelectAll ? 'désélectionner' : 'sélectionner'}
                </Typography>
              }
            />
            <ListMui
              id={scrollableUuid.current}
              component="nav"
              aria-labelledby="nested-list-subheader"
              style={{ maxHeight: '40vh', overflow: 'auto' }}
            >
              <InfiniteScroll
                scrollableTarget={scrollableUuid.current}
                dataLength={elemsToRenderLimit}
                next={handleFetchNext}
                hasMore={elemsToRenderLimit < count}
                scrollThreshold={0.9}
                loader={<Fragment />}
              >
                {allElements.slice(0, elemsToRenderLimit).map((elem) => (
                  <ListItemWrapper key={elem.props.id} divider disableGutters sx={{ cursor: 'default' }}>
                    <ListItemIcon>
                      <Checkbox
                        checked={selectedIds.get(elem.props.id)}
                        onChange={() => handleCheck(elem.props.id)}
                        color="info"
                      />
                    </ListItemIcon>
                    {elem}
                  </ListItemWrapper>
                ))}
              </InfiniteScroll>
            </ListMui>
          </Grid>
        ) : (
          <Grid item xs={12} container alignItems="center" justifyContent="center">
            <Typography fontWeight="700" align="center" sx={{ padding: '8px' }}>
              Aucun élément trouvé.
            </Typography>
          </Grid>
        )}
      </Grid>

      {onDelete && (
        <Modal
          width="250px"
          open={toggleDeleteModal}
          onClose={() => {
            context?.updateError(false)
            setToggleDeleteModal(false)
          }}
          onSubmit={() => {
            onDelete(Object.keys(selectedIds))
            context?.updateError(false)
          }}
        >
          <Typography sx={{ color: '#00000099' }} fontWeight={600} fontSize={14}>
            Êtes-vous sur de vouloir supprimer les éléments sélectionnés ?
          </Typography>
        </Modal>
      )}
    </Grid>
  )
}

export default List
