import React, { useLayoutEffect, useMemo, useRef, useState } from 'react'

import { ButtonGroup, Button, IconButton, CircularProgress, Grid } from '@mui/material'

import AddIcon from '@mui/icons-material/Add'

import LogicalOperatorItem from './components/LogicalOperatorItem'
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
  moveCriteria,
  suspendCount,
  unsuspendCount
} from 'state/cohortCreation'

import useStyles from './styles'
import { SelectedCriteriaType } from 'types/requestCriterias'
import { getStageDetails } from '../CriteriaCount'
import { DndContext, DragEndEvent, PointerSensor, UniqueIdentifier, useSensor, useSensors } from '@dnd-kit/core'
import { SortableContext } from '@dnd-kit/sortable'
import Draggable from 'components/ui/DragAndDrop/Draggable'
import { snapVerticalCenterToCursor } from 'components/ui/DragAndDrop/snapVerticalCenterToCursor'

const OVERFLOW = 1
const HEADER = 74

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

  const { list, operator } = useMemo(() => {
    const currentGroup = groups.find((group) => group.id === itemId)
    if (!currentGroup) return { list: [], operator: null }

    const toDisplay = currentGroup.criteriaIds
      .map((id) => groups.find((g) => g.id === id) ?? criterias.find((c) => c.id === id))
      .filter((item): item is SelectedCriteriaType | CriteriaGroup => !!item)
    const criteriaList = toDisplay.filter((item) => item.id > 0) as SelectedCriteriaType[]
    const operatorGroup = toDisplay.find((item) => item.id < 0) as CriteriaGroup | null
    const listWithPlaceholders: (SelectedCriteriaType | { id: string; disabled: true })[] = [
      { id: `start-${itemId}`, disabled: true },
      ...criteriaList,
      { id: `end-${itemId}`, disabled: true }
    ]
    return {
      list: listWithPlaceholders,
      operator: operatorGroup
    }
  }, [groups, criterias, itemId])

  return (
    <>
      <Draggable data={{ id: `operator-${itemId}`, groupId: itemId }} disabled>
        <LogicalOperatorItem itemId={itemId} criteriaCount={getStageDetails(itemId, idRemap, stageDetails)} />
      </Draggable>
      <Grid
        container
        direction="column"
        justifyContent="center"
        className={classes.operatorChild}
        style={{ height: 30, marginBottom: -12, paddingLeft: 0 }}
      >
        <AvatarWrapper
          style={{ backgroundColor: '#FFE2A9', color: '#153D8A', marginLeft: '-14px', fontWeight: 'bold' }}
        >
          {Math.abs(itemId) + 1}
        </AvatarWrapper>
      </Grid>

      <div className={classes.operatorChild}>
        {list.map((item) => {
          const dropZone = typeof item.id === 'string'
          return (
            <Grid margin={dropZone ? 0 : '15px 0px'} key={`${itemId}-${item.id}`}>
              <Draggable data={{ ...item, groupId: itemId }} dropZone={dropZone}>
                <CriteriaCardItem
                  criteriaCount={getStageDetails(item?.id as number, idRemap, stageDetails)}
                  criterion={item as SelectedCriteriaType}
                  duplicateCriteria={duplicateCriteria}
                  deleteCriteria={deleteCriteria}
                  editCriteria={(item: SelectedCriteriaType) => editCriteria(item, itemId)}
                />
              </Draggable>
            </Grid>
          )
        })}
        {operator && (
          <OperatorItem
            itemId={operator.id}
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
  const [openDrawer, setOpenDrawer] = useState<'criteria' | null>(null)
  const [scroll, setScroll] = useState(false)
  const topRef = useRef<HTMLDivElement>(null)
  const [remainingHeight, setRemainingHeight] = useState<number>(0)
  const { request, criteria } = useAppSelector((state) => state.cohortCreation || {})
  const [parentId, setParentId] = useState<number | null>(null)
  const [selectedCriteria, setSelectedCriteria] = useState<SelectedCriteriaType | null>(null)
  const { criteriaGroup = [] } = request
  const criteriasIds: UniqueIdentifier[] = useMemo(
    () =>
      criteriaGroup.flatMap((group) => [
        `start-${group.id}`,
        ...group.criteriaIds.filter((id) => id > 0),
        `end-${group.id}`,
        ...group.criteriaIds.filter((id) => id < 0).map((id) => `operator-${id}`)
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

  useLayoutEffect(() => {
    const calculateHeight = () => {
      if (topRef.current) {
        const bottom = topRef.current.getBoundingClientRect().bottom
        const available = window.innerHeight - bottom - HEADER - OVERFLOW
        setRemainingHeight(available < 0 ? 0 : available)
      }
    }

    calculateHeight()
    window.addEventListener('resize', calculateHeight)
    return () => window.removeEventListener('resize', calculateHeight)
  }, [])

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

  const onDragStart = () => {
    setScroll(true)
  }

  const onDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    setScroll(false)
    if (!over || active.id === over.id) return
    const _active = { id: active.id as number, groupId: active.data.current?.groupId as number }
    const overId = typeof over.id === 'string' ? null : over.id
    const _over = { id: overId, groupId: over.data.current?.groupId as number }
    dispatch(moveCriteria({ active: _active, over: _over }))
    _buildCohortCreation()
  }

  return (
    <>
      <div ref={topRef}>
        <DndContext
          onDragEnd={onDragEnd}
          onDragStart={onDragStart}
          sensors={sensors}
          modifiers={[snapVerticalCenterToCursor]}
        >
          <SortableContext items={criteriasIds}>
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
      </div>
      <Grid height={scroll ? remainingHeight : 0} />

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
