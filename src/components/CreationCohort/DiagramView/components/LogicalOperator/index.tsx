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
  editAllCriteriaGroup,
  editCriteriaGroup,
  editSelectedCriteria,
  suspendCount,
  unsuspendCount
} from 'state/cohortCreation'

import useStyles from './styles'
import { CriteriaType, SelectedCriteriaType } from 'types/requestCriterias'
import { getStageDetails } from '../CriteriaCount'
import { DndContext, DragEndEvent, PointerSensor, UniqueIdentifier, useSensor, useSensors } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import Draggable from 'components/ui/DragAndDrop/Draggable'
import List from 'components/ui/DragAndDrop'
import { cloneDeep } from 'lodash'

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

  const { list, operator }: { list: SelectedCriteriaType[]; operator: CriteriaGroup | null } = useMemo(() => {
    const currentCriteriaGroup = groups.find((group) => group.id === itemId)
    if (!currentCriteriaGroup) return { list: [], operator: null }

    const toDisplay = currentCriteriaGroup.criteriaIds
      .map((criteriaId) => groups.find((g) => g.id === criteriaId) ?? criterias.find((c) => c.id === criteriaId))
      .filter((item): item is SelectedCriteriaType | CriteriaGroup => item !== undefined)
    const criteriaList = toDisplay.filter((item) => item.id > 0)
    const operatorGroup = toDisplay.find((item) => item.id < 0) ?? null
    const startPlaceholder = { id: `start-${-itemId}`, disabled: true }
    const endPlaceholder = criteriaList.length > 0 ? { id: `end-${-itemId}`, disabled: true } : {}

    return {
      list: [startPlaceholder, ...criteriaList, endPlaceholder && endPlaceholder],
      operator: operatorGroup
    }
  }, [groups, criterias, itemId])

  const onCreateCriteria = (criteria: SelectedCriteriaType, disabled: boolean) => (
    <CriteriaCardItem
      criteriaCount={getStageDetails(criteria?.id as number, idRemap, stageDetails)}
      criterion={criteria as SelectedCriteriaType}
      duplicateCriteria={disabled ? undefined : duplicateCriteria}
      deleteCriteria={disabled ? undefined : deleteCriteria}
      editCriteria={disabled ? undefined : (item: SelectedCriteriaType) => editCriteria(item, itemId)}
    />
  )

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
        {list.map((item) => (
          <Grid marginTop="30px" key={`${itemId}-${item.id}`}>
            <Draggable data={{ ...item, groupId: itemId }} disabled={item.disabled}>
              <CriteriaCardItem
                criteriaCount={getStageDetails(item?.id as number, idRemap, stageDetails)}
                criterion={item as SelectedCriteriaType}
                duplicateCriteria={item.disabled ? undefined : duplicateCriteria}
                deleteCriteria={item.disabled ? undefined : deleteCriteria}
                editCriteria={item.disabled ? undefined : (item: SelectedCriteriaType) => editCriteria(item, itemId)}
              />
            </Draggable>
          </Grid>
        ))}
        {/*<List spacing="30px" groupId={itemId} items={list} onCreateChild={onCreateCriteria} />*/}
        {operator && (
          <OperatorItem
            itemId={operator.id as number}
            groups={groups}
            addNewCriteria={addNewCriteria}
            addNewGroup={addNewGroup}
            duplicateCriteria={duplicateCriteria}
            deleteCriteria={deleteCriteria}
            editCriteria={editCriteria}
          />
        )}
      </div>

      <div className={classes.operatorChild} style={{ height: 12, marginBottom: -14 }}></div>

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
              style={{ borderRadius: '18px 0 0 18px', zIndex: 1000 }}
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
              style={{ borderRadius: '0 18px 18px 0', zIndex: 1000 }}
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
  const criteriasIds: UniqueIdentifier[] = useMemo(
    () =>
      criteriaGroup.flatMap((group) => [
        `start-${group.id * -1}`,
        ...group.criteriaIds.filter((ids) => ids > 0),
        `end-${group.id * -1}`
      ]),
    [criteriaGroup]
  )

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 1
      }
    })
  )

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

  const onDragEnd = (event: DragEndEvent, ids: UniqueIdentifier[]) => {
    const { active, over } = event
    if (!over || active.id === over.id) return
    const newGroups = cloneDeep(criteriaGroup)
    console.log('test move', ids, active.id, over.id)
    const findIndexPred = (ids: UniqueIdentifier[]) => {
      const overIndex = ids.indexOf(over.id)
      return typeof over.id === 'string' && over.id.includes('end') ? overIndex : overIndex + 1
    }
    const newIds = ids.filter((id) => id !== active.id)
    newIds.splice(findIndexPred(newIds), 0, active.id as number)
    console.log(
      'test move',
      newIds
    ) /*const toCriteriaIndex = newGroups[toGroupIndex].criteriaIds.indexOf(over.id as number)
    /*const fromGroupIndex = newGroups.findIndex((group) => group.id === active.data.current?.groupId)
    const fromCriteriaIndex = newGroups[fromGroupIndex].criteriaIds.indexOf(active.id as number)
    const toGroupIndex = newGroups.findIndex((group) => group.id === over.data.current?.groupId)
    const toCriteriaIndex = (() => {
      if (typeof over.id === 'string' && over.id.startsWith('start-')) return 0
      if (typeof over.id === 'string' && over.id.startsWith('end-'))
        return newGroups[toGroupIndex].criteriaIds.filter((id) => id > -1).length
      return newGroups[toGroupIndex].criteriaIds.indexOf(over.id as number)
    })()
    console.log('test indexes', over.id, 'groups', fromGroupIndex, fromCriteriaIndex, toGroupIndex, toCriteriaIndex)
    
    newGroups[fromGroupIndex].criteriaIds.splice(fromCriteriaIndex, 1)
    newGroups[toGroupIndex].criteriaIds.splice(toCriteriaIndex, 0, active.id as number)
    dispatch(editAllCriteriaGroup(newGroups))
    _buildCohortCreation()*/
  }

  useEffect(() => {
    console.log('test update criteriaGroup', criteriaGroup)
  }, [criteriaGroup])
  useEffect(() => {
    console.log('test update criteriasIds', criteriasIds)
  }, [criteriasIds])

  return (
    <>
      <DndContext onDragEnd={(event) => onDragEnd(event, criteriasIds)} sensors={sensors}>
        <SortableContext items={criteriasIds} strategy={verticalListSortingStrategy}>
          <OperatorItem
            groups={criteriaGroup}
            itemId={0}
            addNewCriteria={_addNewCriteria}
            addNewGroup={_addNewGroup}
            duplicateCriteria={_duplicateCriteria}
            deleteCriteria={_deleteCriteria}
            editCriteria={_editCriteria}
          />
        </SortableContext>
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
