import React, { useState, useEffect } from 'react'
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
  MenuItem,
  TextField,
  Typography,
  Select,
  Switch
} from '@material-ui/core'

import { withStyles } from '@material-ui/core/styles'

import DeleteIcon from '@material-ui/icons/Delete'
import EditIcon from '@material-ui/icons/Edit'

import CriteriaRightPanel from '../CriteriaRightPanel/CriteriaRightPanel'
import CriteriaCardContent from '../CriteriaCardContent/CriteriaCardContent'
import GroupSeparator from '../../../GroupSeparator/GroupSeparator'

import { CriteriaItemType, SelectedCriteriaType, CriteriaGroupType } from 'types'

import {
  CohortCreationState,
  addNewSelectedCriteria,
  addNewCriteriaGroup,
  editCriteriaGroup,
  editSelectedCriteria,
  deleteSelectedCriteria,
  deleteCriteriaGroup
} from 'state/cohortCreation'

import useStyles from './styles'

const SwitchInclusive = withStyles({
  switchBase: {
    color: '#DAF0BF',
    '&$checked': {
      color: '#FFC695'
    },
    '&$checked + $track': {
      backgroundColor: '#FFC695'
    }
  },
  checked: {},
  track: {
    backgroundColor: '#DAF0BF'
  }
})(Switch)

type GroupListItemProps = {
  itemId: number
  editItem: (itemId: number) => void
  deleteItem: (itemId: number) => void
}

const GroupListItem: React.FC<GroupListItemProps> = ({ itemId, editItem, deleteItem }) => {
  const classes = useStyles()
  const dispatch = useDispatch()

  const { selectedCriteria = [], criteriaGroup = [] } = useAppSelector<{
    selectedCriteria: SelectedCriteriaType[]
    criteriaGroup: CriteriaGroupType[]
  }>((state) => state.cohortCreation.request || {})

  const isGroupObject = itemId < 0
  if (!isGroupObject) {
    const currentItem: any = selectedCriteria.find((criteria) => criteria.id === itemId)
    if (!currentItem) {
      // Bug, not possible ... The current item is not a criteria and is not a group ...
      return <></>
    }

    const _editIsInclusive = (isInclusive: boolean) => {
      const _currentItem = currentItem ? { ...currentItem, isInclusive } : null

      dispatch(editSelectedCriteria(_currentItem))
    }

    return (
      <ListItem classes={{ root: classes.listItem }} alignItems="flex-start">
        <ListItemText
          classes={{ primary: classes.listTitle, secondary: classes.listDesc }}
          primary={currentItem.title}
          secondaryTypographyProps={{ component: 'span' }}
          secondary={<CriteriaCardContent currentCriteria={currentItem} />}
        />
        <ListItemSecondaryAction>
          <SwitchInclusive
            checked={!currentItem.isInclusive}
            onChange={(e) => _editIsInclusive(!e.target.checked)}
            edge="end"
          />
          <IconButton onClick={() => editItem(itemId)} color="primary" edge="end" aria-label="edit">
            <EditIcon />
          </IconButton>
          <IconButton onClick={() => deleteItem(itemId)} color="primary" edge="end" aria-label="delete">
            <DeleteIcon />
          </IconButton>
        </ListItemSecondaryAction>
      </ListItem>
    )
  } else {
    const currentItem = criteriaGroup.find((criteria) => criteria.id === itemId)
    if (!currentItem) {
      // Bug, not possible ... The current item is not a criteria and is not a group ...
      return <></>
    }

    const _editIsInclusive = (isInclusive: boolean) => {
      const _currentItem = currentItem ? { ...currentItem, isInclusive } : null

      if (_currentItem === null) return

      dispatch(editCriteriaGroup(_currentItem))
    }

    return (
      <ListItem classes={{ root: classes.groupListItem }} alignItems="flex-start">
        <ListItemText classes={{ primary: classes.listTitle }} primary={currentItem.title} />

        <List style={{ width: '90%', alignSelf: 'center' }}>
          {currentItem.criteriaIds.length > 0 &&
            currentItem.criteriaIds.map((criteriaId, index) => {
              const isLastItem = index === currentItem.criteriaIds.length - 1
              return (
                <React.Fragment key={criteriaId}>
                  <GroupListItem key={criteriaId} editItem={editItem} deleteItem={deleteItem} itemId={criteriaId} />
                  {!isLastItem && <GroupSeparator groupType={currentItem.type} />}
                </React.Fragment>
              )
            })}
        </List>

        <ListItemSecondaryAction style={{ top: 26 }}>
          <SwitchInclusive
            edge="end"
            checked={!currentItem.isInclusive}
            onChange={(e) => _editIsInclusive(!e.target.checked)}
          />
          <IconButton onClick={() => editItem(itemId)} color="primary" edge="end" aria-label="edit">
            <EditIcon />
          </IconButton>
          <IconButton onClick={() => deleteItem(itemId)} color="primary" edge="end" aria-label="delete">
            <DeleteIcon />
          </IconButton>
        </ListItemSecondaryAction>
      </ListItem>
    )
  }
}

const initialState: CriteriaGroupType = {
  id: 0,
  title: 'Groupe de critère',
  type: 'andGroup',
  criteriaIds: [],
  isSubGroup: false,
  isInclusive: true
}

type GroupRightPanelProps = {
  open: boolean
  currentCriteriaGroup: CriteriaGroupType | null
  isSubGroup?: boolean
  onClose: (newSubGroupId?: number) => void
}

const GroupRightPanel: React.FC<GroupRightPanelProps> = (props) => {
  const { open, currentCriteriaGroup, isSubGroup, onClose } = props

  const isEditing = currentCriteriaGroup !== null

  const classes = useStyles()
  const dispatch = useDispatch()

  const { criteria = [], request } = useAppSelector<{
    criteria: CriteriaItemType[]
    request: CohortCreationState
  }>((state) => state.cohortCreation)

  const [openDrawer, setOpenDrawer] = useState<'criteria' | 'group' | null>(null)
  const [selectedItemId, setSelectedItemId] = useState<number>(0)
  const [currentGroup, editCurrentGroup] = useState<CriteriaGroupType>(
    currentCriteriaGroup ?? { ...initialState, isSubGroup }
  )

  useEffect(() => {
    editCurrentGroup(currentCriteriaGroup ?? { ...initialState, isSubGroup })
  }, [open]) // eslint-disable-line

  const _addNewItem = (type: 'criteria' | 'group') => {
    setSelectedItemId(0)
    setOpenDrawer(type)
  }

  const _addCriteria = (newCriteria: SelectedCriteriaType) => {
    const isEdition = request?.selectedCriteria?.find(({ id }) => id === selectedItemId) !== undefined
    if (isEdition) {
      newCriteria.id = selectedItemId
      dispatch(editSelectedCriteria(newCriteria))
      setOpenDrawer(null)
    } else {
      newCriteria.id = request.nextCriteriaId
      dispatch(addNewSelectedCriteria(newCriteria))
      editCurrentGroup({
        ...currentGroup,
        criteriaIds: [...currentGroup.criteriaIds, newCriteria.id]
      })
    }
  }

  const _addSubGroup = (newSubGroupId?: number) => {
    if (newSubGroupId === undefined) return
    editCurrentGroup({
      ...currentGroup,
      criteriaIds: [...currentGroup.criteriaIds, newSubGroupId]
    })
    setOpenDrawer(null)
  }

  const _addGroup = () => {
    const isEdition = !!currentCriteriaGroup
    if (isEdition) {
      dispatch(editCriteriaGroup(currentGroup))
      onClose()
    } else {
      currentGroup.id = request.nextGroupId
      dispatch(addNewCriteriaGroup(currentGroup))
      editCurrentGroup({
        ...currentGroup,
        criteriaIds: [...currentGroup.criteriaIds, currentGroup.id]
      })
      onClose(currentGroup.id)
    }
  }

  const _editItem = (itemId: number) => {
    if (itemId < 0) {
      const _selectedGroup = request?.criteriaGroup?.find(({ id }) => id === itemId) ?? null
      if (_selectedGroup) {
        setSelectedItemId(itemId)
        setOpenDrawer('group')
      }
    } else {
      const _selectedCriteria = request?.selectedCriteria?.find(({ id }) => id === itemId) ?? null
      if (_selectedCriteria) {
        setSelectedItemId(itemId)
        setOpenDrawer('criteria')
      }
    }
  }

  const _deleteItem = (itemId: number) => {
    if (itemId < 0) {
      const deletedCriteriaGroup = request?.criteriaGroup
        ? request?.criteriaGroup.find(({ id }) => id === itemId)
        : null
      const children = deletedCriteriaGroup?.criteriaIds ?? []
      for (const childItemId of children) {
        if (childItemId > 0) {
          dispatch(deleteSelectedCriteria(childItemId))
        } else {
          _deleteItem(childItemId)
        }
      }
      dispatch(deleteCriteriaGroup(itemId))
    } else {
      dispatch(deleteSelectedCriteria(itemId))
    }
    const criteriaIds = currentGroup.criteriaIds ? [...currentGroup.criteriaIds] : []
    const index = criteriaIds.indexOf(itemId) ?? -1
    if (index !== -1) {
      criteriaIds.splice(index, 1)
      editCurrentGroup({
        ...currentGroup,
        criteriaIds
      })
    }
  }

  return (
    <>
      <Drawer anchor="right" open={open} onClose={() => onClose()}>
        <div className={classes.root}>
          <Grid item className={classes.drawerTitleContainer}>
            {isSubGroup ? (
              <Typography className={classes.title}>
                {!isEditing ? 'Ajouter' : 'Modifier'} un sous-groupe de critère
              </Typography>
            ) : (
              <Typography className={classes.title}>
                {!isEditing ? 'Ajouter' : 'Modifier'} un groupe de critère
              </Typography>
            )}
          </Grid>

          <Grid className={classes.drawerContentContainer}>
            <Grid item>
              <Typography variant="subtitle2">Nom du groupe</Typography>
              <TextField
                variant="outlined"
                margin="normal"
                fullWidth
                placeholder="Groupe de critère"
                value={currentGroup.title}
                onChange={(e) => editCurrentGroup({ ...currentGroup, title: e.target.value })}
              />
            </Grid>
            {currentGroup.criteriaIds.length >= 2 && (
              <Grid item alignItems="center" spacing={1} className={classes.typeCriteriaContainer}>
                <Grid item container direction="row" alignItems="center">
                  <SwitchInclusive
                    checked={!currentGroup.isInclusive}
                    onChange={(e) => editCurrentGroup({ ...currentGroup, isInclusive: !e.target.checked })}
                  />
                  <Typography variant="h6">Exclure les patients correspondants aux critères du groupe</Typography>
                </Grid>
                <Grid item container alignItems="flex-start">
                  <Typography variant="h6">Opérateur logique entre chaque type de groupe</Typography>
                  <Select
                    variant="outlined"
                    fullWidth
                    value={currentGroup.type}
                    //@ts-ignore
                    onChange={(e) => editCurrentGroup({ ...currentGroup, type: e.target.value })}
                  >
                    <MenuItem value={'andGroup'}>ET</MenuItem>
                    <MenuItem value={'orGroup'}>OU</MenuItem>
                    <MenuItem value={'NamongM'}>N parmi M</MenuItem>
                  </Select>
                </Grid>
                {currentGroup.type === 'NamongM' && (
                  <Grid item>
                    <Typography variant="h6">Sélectionner le nombre de critère(s) à inclure/exclure :</Typography>
                    <Grid container alignItems="flex-end">
                      <Select
                        className={classes.operatorSelect}
                        variant="outlined"
                        value={currentGroup.options?.operator ?? '='}
                        onChange={(e) =>
                          editCurrentGroup({
                            ...currentGroup,
                            //@ts-ignore
                            options: { ...currentGroup.options, operator: e.target.value }
                          })
                        }
                      >
                        <MenuItem value={'='}>Nombre égal à</MenuItem>
                        <MenuItem value={'<'}>Moins de</MenuItem>
                        <MenuItem value={'>'}>Plus de </MenuItem>
                        <MenuItem value={'<='}>Au plus</MenuItem>
                        <MenuItem value={'>='}>Au moins</MenuItem>
                      </Select>
                      <TextField
                        variant="outlined"
                        className={classes.numberSelect}
                        type="number"
                        onChange={(e) =>
                          editCurrentGroup({
                            ...currentGroup,
                            options: { ...currentGroup.options, number: parseInt(e.target.value, 10) }
                          })
                        }
                        value={currentGroup.options?.number ?? currentGroup.criteriaIds.length}
                      />
                      <Typography>critère(s) parmi {currentGroup.criteriaIds.length}.</Typography>
                    </Grid>
                  </Grid>
                )}
              </Grid>
            )}
            <Grid item>
              <List>
                {currentGroup.criteriaIds.length > 0 &&
                  currentGroup.criteriaIds.map((criteriaId, index) => {
                    const isLastItem = index === currentGroup.criteriaIds.length - 1
                    return (
                      <React.Fragment key={criteriaId}>
                        <GroupListItem editItem={_editItem} deleteItem={_deleteItem} itemId={criteriaId} />
                        {!isLastItem && <GroupSeparator groupType={currentGroup.type} />}
                      </React.Fragment>
                    )
                  })}
              </List>
            </Grid>
            <Grid item>
              <Button
                style={{ borderRadius: 38 }}
                color="primary"
                variant="contained"
                onClick={() => _addNewItem('criteria')}
              >
                Ajouter un critère
              </Button>
            </Grid>
            {/* FIXME: adding subgroups of criteria disabled*/}
            {/*<Button*/}
            {/*  // disabled={isSubGroup}*/}
            {/*  style={{ borderRadius: 38, marginLeft: 8 }}*/}
            {/*  color="primary"*/}
            {/*  variant="contained"*/}
            {/*  onClick={() => _addNewItem('group')}*/}
            {/*>*/}
            {/*  Ajouter un sous groupe de critère*/}
            {/*</Button>*/}
          </Grid>
        </div>

        <Grid className={classes.groupActionContainer}>
          {!currentCriteriaGroup && (
            <Button onClick={() => onClose()} color="primary" variant="outlined">
              Annuler
            </Button>
          )}
          <Button onClick={_addGroup} type="submit" color="primary" variant="contained">
            Confirmer
          </Button>
        </Grid>
      </Drawer>

      {open && (
        <GroupRightPanel
          isSubGroup
          currentCriteriaGroup={request?.criteriaGroup?.find(({ id }) => id === selectedItemId) ?? null}
          open={openDrawer === 'group'}
          onClose={(newSubGroupId?: number) => (newSubGroupId ? _addSubGroup(newSubGroupId) : setOpenDrawer(null))}
        />
      )}

      <CriteriaRightPanel
        criteria={criteria}
        selectedCriteria={request?.selectedCriteria?.find(({ id }) => id === selectedItemId) ?? null}
        onChangeSelectedCriteria={_addCriteria}
        open={openDrawer === 'criteria'}
        onClose={() => setOpenDrawer(null)}
        goBack={() => setOpenDrawer(null)}
      />
    </>
  )
}

export default GroupRightPanel
