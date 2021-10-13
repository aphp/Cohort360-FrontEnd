import React, { useState } from 'react'
import { useDispatch } from 'react-redux'

import { ButtonGroup, Button, IconButton, CircularProgress } from '@material-ui/core'

import AddIcon from '@material-ui/icons/Add'

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
  deleteSelectedCriteria,
  suspendCount,
  unsuspendCount
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

  let timeout: any = null

  const [isExpanded, onExpand] = useState(false)

  return (
    <>
      {isExpanded && <div className={classes.backDrop} onClick={() => onExpand(false)} />}

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
                  key={child?.id}
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
                  deleteCriteria={deleteCriteria}
                  editCriteria={editCriteria}
                />
              )
            })
          })}
      </div>

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
        <ButtonGroup disableElevation className={classes.buttonContainer} variant="contained" color="primary">
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
  const dispatch = useDispatch()
  const { request, criteria } = useAppSelector((state) => state.cohortCreation || {})

  const [parentId, setParentId] = useState<number | null>(null)
  const [openDrawer, setOpenDrawer] = useState<'criteria' | null>(null)
  const [selectedCriteria, setSelectedCriteria] = useState<SelectedCriteriaType | null>(null)

  const _buildCohortCreation = () => {
    dispatch<any>(buildCohortCreation({}))
  }

  const _onConfirmAddOrEditCriteria = async (item: SelectedCriteriaType) => {
    // Add criteria
    const nextCriteriaId = request.nextCriteriaId
    if (item.id !== undefined) {
      // Edition
      await dispatch<any>(editSelectedCriteria(item))
    } else {
      // Creation
      item.id = nextCriteriaId
      await dispatch<any>(addNewSelectedCriteria(item))
      // Link criteria with group operator
      const currentParent = request.criteriaGroup ? request.criteriaGroup.find(({ id }) => id === parentId) : null
      if (!currentParent) return
      await dispatch<any>(
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
    const nextGroupId = request.nextGroupId
    const newOperator: CriteriaGroupType = {
      id: nextGroupId,
      title: `Nouveau opérateur logique ${nextGroupId * -1}`,
      type: 'orGroup',
      criteriaIds: [],
      isSubGroup: parentId === 0 ? false : true,
      isInclusive: true
    }
    await dispatch<any>(addNewCriteriaGroup(newOperator))
    // Edit parent and add nextGroupId inside criteriaIds
    const currentParent = request.criteriaGroup ? request.criteriaGroup.find(({ id }) => id === parentId) : null
    if (!currentParent) return
    await dispatch<any>(
      editCriteriaGroup({
        ...currentParent,
        criteriaIds: [...currentParent.criteriaIds, nextGroupId]
      })
    )
    _buildCohortCreation()
  }

  const _addNewCriteria = (parentId: number) => {
    dispatch<any>(suspendCount())
    setOpenDrawer('criteria')
    setParentId(parentId)
    setSelectedCriteria(null)
  }

  const _editCriteria = (criteria: SelectedCriteriaType, parentId: number) => {
    dispatch<any>(suspendCount())
    setOpenDrawer('criteria')
    setParentId(parentId)
    setSelectedCriteria(criteria)
  }

  const _deleteCriteria = async (criteriaId: number) => {
    await dispatch<any>(deleteSelectedCriteria(criteriaId))
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
        onClose={() => {
          dispatch<any>(unsuspendCount())
          setOpenDrawer(null)
        }}
      />
    </>
  )
}

export default LogicalOperator
