import React, { useEffect, useMemo, useState } from 'react'

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
import { DndContext, DragEndEvent, DragOverlay, DragStartEvent } from '@dnd-kit/core'
import { arrayMove, SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { createPortal } from 'react-dom'

type OperatorItemProps = {
  itemId: number
  groups: CriteriaGroup[]
  addNewCriteria: (parentId: number) => void
  addNewGroup: (parentId: number) => void
  deleteCriteria: (criteriaId: number) => void
  duplicateCriteria: (criteriaId: number) => void
  editCriteria: (criteria: SelectedCriteriaType, parentId: number) => void
}

const OperatorItem: React.FC<OperatorItemProps> = ({
  itemId,
  groups,
  addNewCriteria,
  addNewGroup,
  deleteCriteria,
  duplicateCriteria,
  editCriteria
}) => {
  const { classes } = useStyles()
  const { request } = useAppSelector((state) => state.cohortCreation || {})
  const { loading = false, selectedCriteria: criterias = [], count = {}, idRemap } = request
  const { extra: stageDetails } = count

  const maintenanceIsActive = useAppSelector((state) => state.me?.maintenance?.active ?? false)

  let timeout: NodeJS.Timeout | null = null

  const [isExpanded, setIsExpanded] = useState(false)

  const displayedItems = useMemo(() => {
    const currentCriteriaGroup = groups.filter((group: CriteriaGroup) => group.id === itemId)?.[0]
    if (!currentCriteriaGroup) return []
    const toDisplay: (SelectedCriteriaType | CriteriaGroup)[] = []
    currentCriteriaGroup.criteriaIds.forEach((criteriaId) => {
      const foundItem = groups.find(({ id }) => id === criteriaId) ?? criterias.find(({ id }) => id === criteriaId)
      if (foundItem) toDisplay.push(foundItem)
    })
    return toDisplay
  }, [groups, criterias, itemId])

  return (
    <>
      <LogicalOperatorItem itemId={itemId} criteriaCount={getStageDetails(itemId, idRemap, stageDetails)} />
      <Grid
        container
        direction="column"
        justifyContent="center"
        className={classes.operatorChild}
        style={{ height: 30, marginBottom: -12, paddingLeft: 0 }}
      >
        <AvatarWrapper backgroundColor="#FFE2A9" color="#153D8A" marginLeft={'-14px'} bold>
          {Math.abs(itemId) + 1}
        </AvatarWrapper>
      </Grid>
      <div className={classes.operatorChild}>
        {displayedItems?.map((criteria) => {
          return criteria?.id > 0 ? (
            <CriteriaCardItem
              key={criteria?.id}
              criteriaCount={getStageDetails(criteria?.id, idRemap, stageDetails)}
              criterion={criteria as SelectedCriteriaType}
              duplicateCriteria={duplicateCriteria}
              deleteCriteria={deleteCriteria}
              editCriteria={(item: SelectedCriteriaType) => editCriteria(item, itemId)}
            />
          ) : (
            <OperatorItem
              groups={groups}
              key={criteria?.id}
              itemId={criteria?.id}
              addNewCriteria={addNewCriteria}
              addNewGroup={addNewGroup}
              duplicateCriteria={duplicateCriteria}
              deleteCriteria={deleteCriteria}
              editCriteria={editCriteria}
            />
          )
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
                setIsExpanded(false)
              }}
              onMouseLeave={() => (timeout = setTimeout(() => setIsExpanded(false), 800))}
              onMouseEnter={() => {
                setIsExpanded(true)
                if (timeout) clearInterval(timeout)
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
                setIsExpanded(false)
              }}
              onMouseLeave={() => (timeout = setTimeout(() => setIsExpanded(false), 800))}
              onMouseEnter={() => {
                setIsExpanded(true)
                if (timeout) clearInterval(timeout)
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
  const { criteriaGroup = [] } = request
  const [groups, setGroups] = useState<CriteriaGroup[]>(criteriaGroup)
  const criteriasIds = useMemo(() => groups.flatMap((group) => group.criteriaIds.filter((id) => id > 0)), [groups])
  const [draggedCriterion, setDraggedCriterion] = useState<SelectedCriteriaType | null>(null)

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

  const onDragStart = (event: DragStartEvent) => {
    setDraggedCriterion(event.active.data.current.criterion)
  }

  const onDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (!over) return
    setGroups((prevGroups) => {
      const newGroups = prevGroups.map((group) => ({
        ...group,
        criteriaIds: [...group.criteriaIds]
      }))
      const fromGroupIndex = newGroups.findIndex((group) => group.criteriaIds.includes(active.id))
      const fromCriteriaIndex = newGroups[fromGroupIndex].criteriaIds.indexOf(active.id)
      const toGroupIndex = newGroups.findIndex((group) => group.criteriaIds.includes(over.id))
      const toCriteriaIndex = newGroups[toGroupIndex].criteriaIds.indexOf(over.id)
      newGroups[fromGroupIndex].criteriaIds.splice(fromCriteriaIndex, 1)
      newGroups[toGroupIndex].criteriaIds.splice(toCriteriaIndex, 0, active.id)
      return newGroups
    })
  }

  useEffect(() => {
    console.log('test ids', criteriasIds)
  }, [criteriasIds])

  return (
    <>
      <DndContext onDragStart={onDragStart} onDragEnd={onDragEnd}>
        <SortableContext items={criteriasIds} strategy={verticalListSortingStrategy}>
          <OperatorItem
            groups={groups}
            itemId={0}
            addNewCriteria={_addNewCriteria}
            addNewGroup={_addNewGroup}
            duplicateCriteria={_duplicateCriteria}
            deleteCriteria={_deleteCriteria}
            editCriteria={_editCriteria}
          />
        </SortableContext>
        {/*createPortal(
          <DragOverlay>
            {draggedCriterion && <CriteriaCardItem key={draggedCriterion?.id} criterion={draggedCriterion} />}
          </DragOverlay>,
          document.body
        )*/}
      </DndContext>

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
