import React, { useState } from 'react'
import { useDispatch } from 'react-redux'
import { useAppSelector } from 'state'

import Drawer from '@material-ui/core/Drawer'
import {
  Button,
  Grid,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  TextField,
  Typography,
  Switch
} from '@material-ui/core'

import DeleteIcon from '@material-ui/icons/Delete'
import EditIcon from '@material-ui/icons/Edit'

import CriteriaRightPanel from '../CriteriaRightPanel/CriteriaRightPanel'
import CriteriaCardContent from '../CriteriaCardContent/CriteriaCardContent'

import { CriteriaItemType, SelectedCriteriaType, CriteriaGroupType } from 'types'

import { addNewSelectedCriteria, CohortCreationState } from 'state/cohortCreation'

import useStyles from './styles'

type GroupListItemProps = {
  itemId: number
  index?: number
}

const GroupListItem: React.FC<GroupListItemProps> = ({ itemId }) => {
  const classes = useStyles()

  const { selectedCriteria = [], criteriaGroup = [] } = useAppSelector<{
    selectedCriteria: SelectedCriteriaType[]
    criteriaGroup: CriteriaGroupType[]
  }>((state) => state.cohortCreation.request || {})

  let currentItem: any = selectedCriteria.find((criteria) => criteria.id === itemId)
  let isGroupObject = false
  if (!currentItem) {
    currentItem = criteriaGroup.find((criteria) => criteria.id === itemId)
    isGroupObject = currentItem !== undefined
  }
  if (!currentItem) {
    // Bug, not possible ... The current item is not a criteria and is not a group ...
    return <></>
  }

  if (!isGroupObject) {
    return (
      <ListItem classes={{ root: classes.listItem }} alignItems="flex-start">
        <ListItemText
          classes={{ primary: classes.listTitle, secondary: classes.listDesc }}
          primary={currentItem.title}
          secondary={<CriteriaCardContent currentCriteria={currentItem} />}
        />
        <ListItemSecondaryAction>
          <Switch edge="end" />
          <IconButton color="primary" edge="end" aria-label="edit">
            <EditIcon />
          </IconButton>
          <IconButton color="primary" edge="end" aria-label="delete">
            <DeleteIcon />
          </IconButton>
        </ListItemSecondaryAction>
      </ListItem>
    )
  } else {
    return <ListItem classes={{ root: classes.listItem }} alignItems="flex-start"></ListItem>
  }
}

type GroupRightPanelProps = {
  open: boolean
  isSubGroup?: boolean
  onClose: () => void
}

const GroupRightPanel: React.FC<GroupRightPanelProps> = (props) => {
  const { open, isSubGroup, onClose } = props

  const classes = useStyles()
  const dispatch = useDispatch()

  const { criteria = [], request } = useAppSelector<{
    criteria: CriteriaItemType[]
    request: CohortCreationState
  }>((state) => state.cohortCreation)

  const [openDrawer, setOpenDrawer] = useState<'criteria' | 'group' | null>(null)

  const [currentGroup, editCurrentGroup] = useState<CriteriaGroupType>({
    id: 0,
    title: 'Groupe de critère',
    type: 'andGroup',
    criteriaIds: []
  })

  const _addNewItem = (type: 'criteria' | 'group') => {
    setOpenDrawer(type)
  }

  const _onAddCriteria = (newCriteria: SelectedCriteriaType) => {
    newCriteria.id = request.nextCriteriaId
    dispatch(addNewSelectedCriteria(newCriteria))
    editCurrentGroup({
      ...currentGroup,
      criteriaIds: [...currentGroup.criteriaIds, newCriteria.id]
    })
  }

  return (
    <>
      <Drawer anchor="right" open={open} onClose={onClose}>
        <div className={classes.root}>
          <Grid className={classes.drawerTitleContainer}>
            {isSubGroup ? (
              <Typography className={classes.title}>Ajouter un sous-groupe de critère</Typography>
            ) : (
              <Typography className={classes.title}>Ajouter un groupe de critère</Typography>
            )}
          </Grid>

          <Grid className={classes.drawerContentContainer}>
            <Typography variant="subtitle2">Groupe de critère</Typography>

            <TextField
              variant="outlined"
              margin="normal"
              fullWidth
              placeholder="Nom du groupe"
              value={currentGroup.title}
              onChange={(e) => editCurrentGroup({ ...currentGroup, title: e.target.value })}
            />

            <List>
              {currentGroup &&
                currentGroup.criteriaIds &&
                currentGroup.criteriaIds.length > 0 &&
                currentGroup.criteriaIds.map((criteriaId, index) => (
                  <GroupListItem key={index} itemId={criteriaId} index={index} />
                ))}
            </List>

            <Button
              style={{ borderRadius: 38 }}
              color="primary"
              variant="contained"
              onClick={() => _addNewItem('criteria')}
            >
              Ajouter un critère
            </Button>

            <Button
              disabled={isSubGroup}
              style={{ borderRadius: 38, marginLeft: 8 }}
              color="primary"
              variant="contained"
              onClick={() => _addNewItem('group')}
            >
              Ajouter un sous groupe de critère
            </Button>
          </Grid>
        </div>

        <Grid className={classes.groupActionContainer}>
          <Button onClick={onClose} color="primary" variant="outlined">
            Annuler
          </Button>
          <Button type="submit" color="primary" variant="contained">
            Confirmer
          </Button>
        </Grid>
      </Drawer>

      {!isSubGroup && <GroupRightPanel isSubGroup open={openDrawer === 'group'} onClose={() => setOpenDrawer(null)} />}

      <CriteriaRightPanel
        criteria={criteria}
        selectedCriteria={null}
        onChangeSelectedCriteria={_onAddCriteria}
        open={openDrawer === 'criteria'}
        onClose={() => setOpenDrawer(null)}
      />
    </>
  )
}

export default GroupRightPanel
