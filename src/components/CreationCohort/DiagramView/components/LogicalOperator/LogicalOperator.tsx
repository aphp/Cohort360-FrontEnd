import React, { useState } from 'react'

import { ButtonGroup, Button, IconButton, CircularProgress, Grid } from '@mui/material'

import AddIcon from '@mui/icons-material/Add'

import LogicalOperatorItem from './components/LogicalOperatorItem/LogicalOperatorItem'
import CriteriaRightPanel from './components/CriteriaRightPanel/CriteriaRightPanel'
import CriteriaCardItem from '../CriteriaCard/CriteriaCard'
import Avatar from 'components/ui/Avatar/Avatar'

import { CriteriaGroupType, SelectedCriteriaType } from 'types'

import { useAppDispatch, useAppSelector } from 'state'
import {
  addNewCriteriaGroup,
  addNewSelectedCriteria,
  buildCohortCreation,
  deleteSelectedCriteria,
  duplicateSelectedCriteria,
  editCriteriaGroup,
  editSelectedCriteria,
  suspendCount,
  unsuspendCount
} from 'state/cohortCreation'
import { MeState } from 'state/me'

import useStyles from './styles'

type OperatorItemProps = {
  itemId: number
  addNewCriteria: (parentId: number) => void
  addNewGroup: (parentId: number) => void
  deleteCriteria: (criteriaId: number) => void
  duplicateCriteria: (criteriaId: number) => void
  editCriteria: (criteria: SelectedCriteriaType, parentId: number) => void
}

const OperatorItem: React.FC<OperatorItemProps> = ({
  itemId,
  addNewCriteria,
  addNewGroup,
  deleteCriteria,
  duplicateCriteria,
  editCriteria
}) => {
  const { classes } = useStyles()

  const { request } = useAppSelector((state) => state.cohortCreation || {})
  const { loading = false, criteriaGroup = [], selectedCriteria = [] } = request

  const { meState } = useAppSelector<{ meState: MeState }>((state) => ({ meState: state.me }))
  const maintenanceIsActive = meState?.maintenance?.active

  const displayingItem = criteriaGroup.filter((_criteriaGroup: CriteriaGroupType) => _criteriaGroup.id === itemId)

  let timeout: NodeJS.Timeout | null = null

  const [isExpanded, onExpand] = useState(false)

  return (
    <>
      {isExpanded && <div className={classes.backDrop} onClick={() => onExpand(false)} />}

      <LogicalOperatorItem itemId={itemId} />

      <Grid
        container
        direction="column"
        justifyContent="center"
        className={classes.operatorChild}
        style={{ height: 30, marginBottom: -12, paddingLeft: 0 }}
      >
        <Avatar content={Math.abs(itemId) + 1} backgroundColor="#FFE2A9" color="#153D8A" marginLeft={'-14px'} bold />
      </Grid>
      <div className={classes.operatorChild}>
        {displayingItem &&
          displayingItem.map(({ criteriaIds }) => {
            const children: (CriteriaGroupType | SelectedCriteriaType | undefined)[] = criteriaIds
              .map((criteriaId: number) => {
                let foundItem: CriteriaGroupType | SelectedCriteriaType | undefined = criteriaGroup.find(
                  ({ id }) => id === criteriaId
                )
                if (!foundItem) {
                  foundItem = selectedCriteria.find(({ id }) => id === criteriaId)
                }
                return foundItem
              })
              .filter((elem) => elem !== undefined)
            if (!children) return <></>

            return children.map((child) => {
              if (!child || child?.id === undefined) return <></>

              return child?.id > 0 ? (
                <CriteriaCardItem
                  key={child?.id}
                  duplicateCriteria={duplicateCriteria}
                  deleteCriteria={deleteCriteria}
                  editCriteria={(item: SelectedCriteriaType) => editCriteria(item, itemId)}
                  itemId={child.id}
                />
              ) : (
                <OperatorItem
                  key={child?.id}
                  itemId={child?.id}
                  addNewCriteria={addNewCriteria}
                  addNewGroup={addNewGroup}
                  duplicateCriteria={duplicateCriteria}
                  deleteCriteria={deleteCriteria}
                  editCriteria={editCriteria}
                />
              )
            })
          })}
      </div>
      <div className={classes.operatorChild} style={{ height: 12, marginBottom: -14 }} />

      {!isExpanded ? (
        <IconButton
          size="small"
          className={classes.addButton}
          onClick={() => onExpand(true)}
          onMouseEnter={() => {
            onExpand(true)
            if (timeout) clearInterval(timeout)
          }}
          onMouseLeave={() => (timeout = setTimeout(() => onExpand(false), 1500))}
        >
          <AddIcon />
        </IconButton>
      ) : (
        <ButtonGroup
          disableElevation
          className={classes.buttonContainer}
          variant="contained"
          color="primary"
          disabled={maintenanceIsActive}
        >
          {loading && (
            <Button disabled>
              <CircularProgress />
            </Button>
          )}
          {!loading && (
            <Button
              color="inherit"
              onClick={() => {
                addNewCriteria(itemId)
                onExpand(false)
              }}
              style={{ borderRadius: '18px 0 0 18px' }}
              disabled={maintenanceIsActive}
            >
              Ajouter un critère
            </Button>
          )}
          {!loading && (
            <Button
              color="inherit"
              onClick={() => {
                addNewGroup(itemId)
                onExpand(false)
              }}
              style={{ borderRadius: '0 18px 18px 0' }}
              disabled={maintenanceIsActive}
            >
              Ajouter un opérateur logique
            </Button>
          )}
        </ButtonGroup>
      )}
    </>
  )
}

const LogicalOperator: React.FC = () => {
  const dispatch = useAppDispatch()
  const { request, criteria } = useAppSelector((state) => state.cohortCreation || {})

  const [parentId, setParentId] = useState<number | null>(null)
  const [openDrawer, setOpenDrawer] = useState<'criteria' | null>(null)
  const [selectedCriteria, setSelectedCriteria] = useState<SelectedCriteriaType | null>(null)

  const _buildCohortCreation = () => {
    dispatch(buildCohortCreation({}))
  }

  const _onConfirmAddOrEditCriteria = async (item: SelectedCriteriaType) => {
    // Add criteria
    const nextCriteriaId = request.nextCriteriaId
    if (item.id !== undefined) {
      // Edition
      await dispatch(editSelectedCriteria(item))
    } else {
      // Creation
      item.id = nextCriteriaId
      await dispatch(addNewSelectedCriteria(item))
      // Link criteria with group operator
      const currentParent = request.criteriaGroup ? request.criteriaGroup.find(({ id }) => id === parentId) : null
      if (!currentParent) return
      await dispatch(
        editCriteriaGroup({
          ...currentParent,
          criteriaIds: [...currentParent.criteriaIds, nextCriteriaId]
        })
      )
    }
    _buildCohortCreation()
  }

  const _addNewGroup = async (parentId: number) => {
    // Add new group
    const currentParent = request.criteriaGroup ? request.criteriaGroup.find(({ id }) => id === parentId) : null
    if (!currentParent) return
    const nextGroupId = request.nextGroupId
    const newOperator: CriteriaGroupType = {
      id: nextGroupId,
      title: `Nouveau opérateur logique ${nextGroupId * -1}`,
      type: currentParent.type === 'orGroup' ? 'andGroup' : 'orGroup',
      criteriaIds: [],
      isSubGroup: parentId === 0 ? false : true,
      isInclusive: true
    }
    await dispatch(addNewCriteriaGroup(newOperator))
    // Edit parent and add nextGroupId inside criteriaIds
    await dispatch(
      editCriteriaGroup({
        ...currentParent,
        criteriaIds: [...currentParent.criteriaIds, nextGroupId]
      })
    )
    _buildCohortCreation()
  }

  const _addNewCriteria = (parentId: number) => {
    dispatch(suspendCount())
    setOpenDrawer('criteria')
    setParentId(parentId)
    setSelectedCriteria(null)
  }

  const _editCriteria = (criteria: SelectedCriteriaType, parentId: number) => {
    dispatch(suspendCount())
    setOpenDrawer('criteria')
    setParentId(parentId)
    setSelectedCriteria(criteria)
  }

  const _deleteCriteria = async (criteriaId: number) => {
    await dispatch(deleteSelectedCriteria(criteriaId))
    _buildCohortCreation()
  }

  const _duplicateCriteria = async (criteriaId: number) => {
    await dispatch(duplicateSelectedCriteria(criteriaId))
    _buildCohortCreation()
  }

  return (
    <>
      <OperatorItem
        itemId={0}
        addNewCriteria={_addNewCriteria}
        addNewGroup={_addNewGroup}
        duplicateCriteria={_duplicateCriteria}
        deleteCriteria={_deleteCriteria}
        editCriteria={_editCriteria}
      />

      <CriteriaRightPanel
        parentId={parentId}
        criteria={criteria}
        selectedCriteria={selectedCriteria}
        onChangeSelectedCriteria={_onConfirmAddOrEditCriteria}
        open={openDrawer === 'criteria'}
        onClose={() => {
          dispatch(unsuspendCount())
          setOpenDrawer(null)
        }}
      />
    </>
  )
}

export default LogicalOperator
