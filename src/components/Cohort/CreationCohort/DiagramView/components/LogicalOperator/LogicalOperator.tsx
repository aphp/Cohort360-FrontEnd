import React, { useState } from 'react'
import { useDispatch } from 'react-redux'

import { ButtonGroup, Button, CircularProgress } from '@material-ui/core'

import LogicalOperatorItem from './components/LogicalOperatorItem/LogicalOperatorItem'
import CriteriaRightPanel from './components/CriteriaRightPanel/CriteriaRightPanel'
import CriteriaCardItem from '../CriteriaCard/CriteriaCard'

import { CriteriaGroupType, SelectedCriteriaType } from 'types'

import { useAppSelector } from 'state'
import {
  addNewCriteriaGroup,
  editCriteriaGroup,
  addNewSelectedCriteria,
  editSelectedCriteria
} from 'state/cohortCreation'

import useStyles from './styles'

type OperatorItemProps = {
  itemId: number
  addNewCriteria: (parentId: number) => void
  addNewGroup: (parentId: number) => void
}

const OperatorItem: React.FC<OperatorItemProps> = ({ itemId, addNewCriteria, addNewGroup }) => {
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
            const children: (CriteriaGroupType | SelectedCriteriaType)[] = [
              ...criteriaGroup.filter((group: CriteriaGroupType) =>
                criteriaIds.find((criteriaId) => group.id === criteriaId)
              ),
              ...selectedCriteria.filter((criteria: SelectedCriteriaType) =>
                criteriaIds.find((criteriaId) => criteria.id === criteriaId)
              )
            ]
            if (!children) return <></>

            return children.map((child: CriteriaGroupType | SelectedCriteriaType) => {
              if (!child || child?.id === undefined) return <></>

              return child?.id > 0 ? (
                <CriteriaCardItem itemId={child.id} />
              ) : (
                <OperatorItem itemId={child?.id} addNewCriteria={addNewCriteria} addNewGroup={addNewGroup} />
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

  const _addOrEditCriteria = (item: SelectedCriteriaType) => {
    // Add criteria
    const nextCriteriaId = request.nextCriteriaId
    if (item.id) {
      // Edition
      dispatch(editSelectedCriteria(item))
    } else {
      // Creation
      item.id = nextCriteriaId
      dispatch(addNewSelectedCriteria(item))
    }
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

  return (
    <>
      <OperatorItem
        itemId={0}
        addNewCriteria={(parentId: number) => {
          setOpenDrawer('criteria')
          setParentId(parentId)
        }}
        addNewGroup={_addNewGroup}
      />

      <CriteriaRightPanel
        criteria={criteria}
        selectedCriteria={null}
        onChangeSelectedCriteria={_addOrEditCriteria}
        open={openDrawer === 'criteria'}
        onClose={() => setOpenDrawer(null)}
      />
    </>
  )
}

export default GroupOperator
