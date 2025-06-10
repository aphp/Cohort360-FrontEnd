import React, { useCallback, useState } from 'react'

import { ButtonGroup, Button, IconButton, CircularProgress, Grid } from '@mui/material'

import AddIcon from '@mui/icons-material/Add'

import LogicalOperatorItem from './components/LogicalOperatorItem/LogicalOperatorItem'
import CriteriaRightPanel from './components/CriteriaRightPanel/CriteriaRightPanel'
import { AvatarWrapper } from 'components/ui/Avatar/styles'
import CriteriaCardItem from '../CriteriaCard'

import { CriteriaGroup, CriteriaGroupType } from 'types'

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

import useStyles from './styles'
import { SelectedCriteriaType } from 'types/requestCriterias'
import { getStageDetails } from '../CriteriaCount'
import List from 'components/ui/DragAndDrop/components/List'
import { useDragAndDrop } from 'components/ui/DragAndDrop/useDragAndDrop'
import { DragEndEvent } from '@dnd-kit/core'

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
  const { loading = false, criteriaGroup = [], selectedCriteria = [], count = {}, idRemap } = request
  const { extra: stageDetails } = count

  const maintenanceIsActive = useAppSelector((state) => state.me?.maintenance?.active ?? false)
  const [isExpanded, setIsExpanded] = React.useState(false)
  let timeout: NodeJS.Timeout | null = null

  // Gestion du drag & drop
  const onDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return

    // Implémente ici la logique de mise à jour de l’arbre
    console.log('Déplacement de', active.id, 'vers', over.id)

    // Idéalement, tu dispatch ici une action Redux ou tu modifies le state
  }, [])

  const { DragAndDropProvider, nodes, setNodes } = useDragAndDrop()

  const displayingItem = criteriaGroup.filter((_criteriaGroup) => _criteriaGroup.id === itemId)

  console.log('test displayingItems', displayingItem)

  return (
    <>
      <LogicalOperatorItem itemId={itemId} criteriaCount={getStageDetails(itemId, idRemap, stageDetails)} />
      <Grid container direction="column" justifyContent="center" className={classes.operatorChild}>
        <AvatarWrapper backgroundColor="#FFE2A9" color="#153D8A" marginLeft="-14px" bold>
          {Math.abs(itemId) + 1}
        </AvatarWrapper>
      </Grid>

      <div className={classes.operatorChild}>
        {displayingItem.map(({ criteriaIds, id }) => {
          const children = criteriaIds
            .map(
              (criteriaId) =>
                criteriaGroup.find((g) => g.id === criteriaId) || selectedCriteria.find((c) => c.id === criteriaId)
            )
            .filter(Boolean)

          /*const nodes: DraggableNode[] =*/ return children.map((child) => {
            //const isGroup = child?.id && child.id < 0
            return (
              <>
                <h1>{child.id}</h1>
                {child?.id && child.id < 0 ? (
                  <OperatorItem
                    itemId={child?.id}
                    addNewCriteria={addNewCriteria}
                    addNewGroup={addNewGroup}
                    deleteCriteria={deleteCriteria}
                    duplicateCriteria={duplicateCriteria}
                    editCriteria={editCriteria}
                  />
                ) : (
                  <CriteriaCardItem
                    criterion={child}
                    criteriaCount={getStageDetails(child.id, idRemap, stageDetails)}
                    duplicateCriteria={duplicateCriteria}
                    deleteCriteria={deleteCriteria}
                    editCriteria={(item) => editCriteria(item, itemId)}
                  />
                )}
              </>
            )
            /*? return {
              id: child?.id ?? 'unknown',
              type: isGroup ? 'group' : 'item',
              content: isGroup ? (
                <OperatorItem
                  itemId={child?.id}
                  addNewCriteria={addNewCriteria}
                  addNewGroup={addNewGroup}
                  deleteCriteria={deleteCriteria}
                  duplicateCriteria={duplicateCriteria}
                  editCriteria={editCriteria}
                />
              ) : (
                <CriteriaCardItem
                  criterion={child}
                  criteriaCount={getStageDetails(child.id, idRemap, stageDetails)}
                  duplicateCriteria={duplicateCriteria}
                  deleteCriteria={deleteCriteria}
                  editCriteria={(item) => editCriteria(item, itemId)}
                />
              )
            }*/
          })

          //  return <List key={id} nodes={nodes} parentId={String(itemId)} />
        })}
      </div>

      <div className={classes.operatorChild} style={{ height: 12, marginBottom: -14 }} />

      {!isExpanded ? (
        <IconButton
          size="small"
          className={classes.addButton}
          onMouseEnter={() => {
            setIsExpanded(true)
            if (timeout) clearInterval(timeout)
          }}
          onMouseLeave={() => (timeout = setTimeout(() => setIsExpanded(false), 1500))}
        >
          <AddIcon />
        </IconButton>
      ) : (
        <ButtonGroup disableElevation className={classes.buttonContainer} variant="contained" color="primary">
          {loading ? (
            <Button disabled>
              <CircularProgress />
            </Button>
          ) : (
            <>
              <Button
                color="inherit"
                onClick={() => {
                  addNewCriteria(itemId)
                  setIsExpanded(false)
                }}
                onMouseEnter={() => {
                  setIsExpanded(true)
                  if (timeout) clearInterval(timeout)
                }}
                onMouseLeave={() => (timeout = setTimeout(() => setIsExpanded(false), 800))}
                style={{ borderRadius: '18px 0 0 18px' }}
                disabled={maintenanceIsActive}
              >
                Ajouter un critère
              </Button>
              <Button
                color="inherit"
                onClick={() => {
                  addNewGroup(itemId)
                  setIsExpanded(false)
                }}
                onMouseEnter={() => {
                  setIsExpanded(true)
                  if (timeout) clearInterval(timeout)
                }}
                onMouseLeave={() => (timeout = setTimeout(() => setIsExpanded(false), 800))}
                style={{ borderRadius: '0 18px 18px 0' }}
                disabled={maintenanceIsActive}
              >
                Ajouter un opérateur logique
              </Button>
            </>
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
    dispatch(buildCohortCreation({ selectedPopulation: null }))
  }

  const _onConfirmAddOrEditCriteria = async (item: SelectedCriteriaType) => {
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

  const _addNewGroup = async (parentId: number) => {
    // Add new group
    const currentParent = request.criteriaGroup ? request.criteriaGroup.find(({ id }) => id === parentId) : null
    if (!currentParent) return
    const nextGroupId = request.nextGroupId
    const newOperator: CriteriaGroup = {
      id: nextGroupId,
      title: 'Groupe de critères',
      type:
        currentParent.type === CriteriaGroupType.OR_GROUP ? CriteriaGroupType.AND_GROUP : CriteriaGroupType.OR_GROUP,
      criteriaIds: [],
      isSubGroup: parentId !== 0,
      isInclusive: true
    }
    dispatch(addNewCriteriaGroup(newOperator))
    // Edit parent and add nextGroupId inside criteriaIds
    dispatch(
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
    dispatch(deleteSelectedCriteria(criteriaId))
    _buildCohortCreation()
  }

  const _duplicateCriteria = async (criteriaId: number) => {
    dispatch(duplicateSelectedCriteria(criteriaId))
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
