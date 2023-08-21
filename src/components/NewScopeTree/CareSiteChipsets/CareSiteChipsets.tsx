import { ScopeTreeRow } from '../../../types'
import { Chip, List, ListItem } from '@mui/material'
import React from 'react'
import useStyles from './styles'

type CareSiteChipsetsType = {
  selectedItems: ScopeTreeRow[]
  onDelete: (item: ScopeTreeRow) => void
}
const CareSiteChipsets: React.FC<CareSiteChipsetsType> = (props) => {
  const { selectedItems, onDelete } = props

  const { classes } = useStyles()

  return (
    <>
      {
        <List className={classes.perimetersChipsDiv}>
          {selectedItems.map((selectedItem) => (
            <ListItem key={Math.random()} className={classes.item}>
              <Chip
                className={classes.perimetersChip}
                label={selectedItem.name}
                onDelete={() => onDelete(selectedItem)}
              />
            </ListItem>
          ))}
        </List>
      }
    </>
  )
}
export default CareSiteChipsets
