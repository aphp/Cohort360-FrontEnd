import React, { PropsWithChildren, useEffect, useState } from 'react'
import { Checkbox, FormControlLabel, Grid, Typography } from '@mui/material'
import { Item } from 'components/ui/List/ListItem'
import ListItems from './ListItems'

type id = string

type ListProps = {
  values: Item[]
  count: number
  onSelect: (value: id[]) => void
  fetchPaginateData: () => void
}

const List = ({ values, count, onSelect, fetchPaginateData }: PropsWithChildren<ListProps>) => {
  const [allElements, setAllElements] = useState<Item[]>([])
  const [selectedElements, setSelectedElements] = useState<string[]>([])
  const [toggleSelectAll, setToggleSelectAll] = useState(false)

  useEffect(() => {
    setAllElements(
      values.map((e) => {
        return { ...e, checked: Boolean(selectedElements.find((selected) => selected === e.id)) }
      })
    )
  }, [values])

  useEffect(() => {
    setSelectedElements(allElements.filter((elem) => elem.checked)?.map((e) => e.id))
  }, [allElements])

  useEffect(() => {
    onSelect(selectedElements)
  }, [selectedElements])

  return (
    <Grid container gap={4} marginTop={2}>
      <Grid container>
        {Boolean(allElements.length) ? (
          <Grid item xs={12}>
            <FormControlLabel
              labelPlacement="end"
              color="warning"
              style={{ margin: 0 }}
              control={
                <Checkbox
                  color="info"
                  onChange={() => {
                    setAllElements(
                      allElements.map((e) => {
                        return { ...e, checked: toggleSelectAll ? false : true }
                      })
                    )
                    setToggleSelectAll(!toggleSelectAll)
                  }}
                />
              }
              label={
                <Typography variant="h3" textTransform="uppercase" color="#0288d1">
                  Tout {toggleSelectAll ? 'désélectionner' : 'sélectionner'}
                </Typography>
              }
            />
            <ListItems
              values={allElements}
              multiple
              count={count}
              onchange={(newItems) => setAllElements(newItems)}
              fetchPaginateData={fetchPaginateData}
            />
          </Grid>
        ) : (
          <Grid item xs={12}>
            <Typography fontWeight="700" align="center" sx={{ padding: '8px' }}>
              Aucun élément.
            </Typography>
          </Grid>
        )}
      </Grid>
    </Grid>
  )
}

export default List
