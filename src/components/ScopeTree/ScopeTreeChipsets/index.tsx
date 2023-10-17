import React from 'react'

import { Chip, List, ListItem } from '@mui/material'

import { ScopeTreeRow } from 'types'
import useStyles from './styles'

type ScopeTreeChipsetsType = {
  selectedItems: ScopeTreeRow[]
  onDelete: (item: ScopeTreeRow) => void
}
const ScopeTreeChipsets: React.FC<ScopeTreeChipsetsType> = (props) => {
  const { selectedItems, onDelete } = props

  const { classes } = useStyles()

  return (
    <List className={classes.perimetersChipsDiv}>
      {selectedItems
        .filter((item) => item.name)
        .map((selectedItem) => (
          <ListItem key={Math.random()} className={classes.item}>
            <Chip
              className={classes.perimetersChip}
              label={selectedItem.name}
              onDelete={() => onDelete(selectedItem)}
            />
          </ListItem>
        ))}
    </List>
  )
}
export default ScopeTreeChipsets
