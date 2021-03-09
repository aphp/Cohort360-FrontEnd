import React, { useState } from 'react'
import { useDispatch } from 'react-redux'

import { ButtonGroup, Button, CircularProgress } from '@material-ui/core'

import LogicalOperatorItem from './components/LogicalOperatorItem/LogicalOperatorItem'
import CriteriaRightPanel from './components/CriteriaRightPanel/CriteriaRightPanel'
import CriteriaCardItem from '../CriteriaCard/CriteriaCard'

import { CriteriaGroupType, SelectedCriteriaType } from 'types'

import { useAppSelector } from 'state'
import {
  buildCohortCreation,
  addNewCriteriaGroup,
  editCriteriaGroup,
  addNewSelectedCriteria,
  editSelectedCriteria,
  deleteSelectedCriteria
} from 'state/cohortCreation'

import useStyles from './styles'

type OperatorItemProps = {
  itemId: number
  addNewCriteria: (parentId: number) => void
  addNewGroup: (parentId: number) => void
  deleteCriteria: (criteriaId: number) => void
  editCriteria: (criteria: SelectedCriteriaType, parentId: number) => void
}

const OperatorItem: React.FC<OperatorItemProps> = ({
  itemId,
  addNewCriteria,
  addNewGroup,
  deleteCriteria,
  editCriteria
}) => {
  const classes = useStyles()

  const { request } = useAppSelector((state) => state.cohortCreation || {})
  const { loading = false, criteriaGroup = [], selectedCriteria = [] } = request

  const displayingItem = criteriaGroup.filter((_criteriaGroup: CriteriaGroupType) => _criteriaGroup.id === itemId)

  return (
    <>
      <LogicalOperatorItem itemId={itemId} />

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
                  deleteCriteria={deleteCriteria}
                  editCriteria={(item: SelectedCriteriaType) => editCriteria(item, itemId)}
                  itemId={child.id}
                />
              ) : (
                <OperatorItem
                  itemId={child?.id}
                  addNewCriteria={addNewCriteria}
                  addNewGroup={addNewGroup}
                  deleteCriteria={deleteCriteria}
                  editCriteria={editCriteria}
                />
              )
            })
          })}
      </div>

      <ButtonGroup disableElevation className={classes.buttonContainer} variant="contained" color="primary">
        {loading && (
          <Button disabled>
            <CircularProgress />
          </Button>
        )}
        {!loading && (
          <Button color="inherit" onClick={() => addNewCriteria(itemId)}>
            Ajouter un critère
          </Button>
        )}
        {!loading && (
          <Button color="inherit" onClick={() => addNewGroup(itemId)}>
            Ajouter un opérateur logique
          </Button>
        )}
      </ButtonGroup>
    </>
  )
}

const GroupOperator: React.FC = () => {
  const dispatch = useDispatch()
  const { request, criteria } = useAppSelector((state) => state.cohortCreation || {})

  const [parentId, setParentId] = useState<number | null>(null)
  const [openDrawer, setOpenDrawer] = useState<'criteria' | null>(null)
  const [selectedCriteria, setSelectedCriteria] = useState<SelectedCriteriaType | null>(null)

  const _buildCohortCreation = () => {
    dispatch(buildCohortCreation({}))
  }

  const _onConfirmAddOrEditCriteria = (item: SelectedCriteriaType) => {
    // Add criteria
    const nextCriteriaId = request.nextCriteriaId
    if (item.id !== undefined) {
      // Edition
      dispatch(editSelectedCriteria(item))
    } else {
      // Creation
      item.id = nextCriteriaId
      dispatch(addNewSelectedCriteria(item))
      // Link criteria with group operator
      const currentParent = request.criteriaGroup ? request.criteriaGroup.find(({ id }) => id === parentId) : null
      if (!currentParent) return
      dispatch(
        editCriteriaGroup({
          ...currentParent,
          criteriaIds: [...currentParent.criteriaIds, nextCriteriaId]
        })
      )
    }
    _buildCohortCreation()
  }

  const _addNewGroup = (parentId: number) => {
    // Add new group
    const nextGroupId = request.nextGroupId
    const newOperator: CriteriaGroupType = {
      id: nextGroupId,
      title: `Nouveau opérateur logique ${nextGroupId * -1}`,
      type: 'orGroup',
      criteriaIds: [],
      isSubGroup: parentId === 0 ? false : true,
      isInclusive: true
    }
    dispatch(addNewCriteriaGroup(newOperator))
    // Edit parent and add nextGroupId inside criteriaIds
    const currentParent = request.criteriaGroup ? request.criteriaGroup.find(({ id }) => id === parentId) : null
    if (!currentParent) return
    dispatch(
      editCriteriaGroup({
        ...currentParent,
        criteriaIds: [...currentParent.criteriaIds, nextGroupId]
      })
    )
  }

  const _addNewCriteria = (parentId: number) => {
    setOpenDrawer('criteria')
    setParentId(parentId)
    setSelectedCriteria(null)
  }

  const _editCriteria = (criteria: SelectedCriteriaType, parentId: number) => {
    setOpenDrawer('criteria')
    setParentId(parentId)
    setSelectedCriteria(criteria)
  }

  const _deleteCriteria = (criteriaId: number) => {
    dispatch(deleteSelectedCriteria(criteriaId))
    const logicalOperatorParent = request.criteriaGroup
      ? request.criteriaGroup.find(({ criteriaIds }) => criteriaIds.find((_criteriaId) => _criteriaId === criteriaId))
      : undefined
    if (!logicalOperatorParent) return
    dispatch(
      editCriteriaGroup({
        ...logicalOperatorParent,
        criteriaIds: logicalOperatorParent.criteriaIds.filter((_criteriaId) => _criteriaId !== criteriaId)
      })
    )
    _buildCohortCreation()
  }

  return (
    <>
      <OperatorItem
        itemId={0}
        addNewCriteria={_addNewCriteria}
        addNewGroup={_addNewGroup}
        deleteCriteria={_deleteCriteria}
        editCriteria={_editCriteria}
      />

      <CriteriaRightPanel
        criteria={criteria}
        selectedCriteria={selectedCriteria}
        onChangeSelectedCriteria={_onConfirmAddOrEditCriteria}
        open={openDrawer === 'criteria'}
        onClose={() => setOpenDrawer(null)}
      />
    </>
  )
}

export default GroupOperator
