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
import { SelectedCriteriaType } from 'types/requestCriterias'
import { getStageDetails } from '../CriteriaCount'
import { DndContext, DragEndEvent, PointerSensor, UniqueIdentifier, useSensor, useSensors } from '@dnd-kit/core'
import { SortableContext } from '@dnd-kit/sortable'
import Draggable from 'components/ui/DragAndDrop/Draggable'

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
        <AvatarWrapper backgroundColor="#FFE2A9" color="#153D8A" marginLeft={'-14px'} bold>
          {Math.abs(itemId) + 1}
        </AvatarWrapper>
      </Grid>

      <div className={classes.operatorChild}>
        {list.map((item) => {
          const dropZone = typeof item.id === 'string'
          return (
            <Grid marginTop="30px" key={`${itemId}-${item.id}`}>
              <Draggable data={{ ...item, groupId: itemId }} dropZone={dropZone}>
                <CriteriaCardItem
                  criteriaCount={getStageDetails(item?.id as number, idRemap, stageDetails)}
                  criterion={item as SelectedCriteriaType}
                  duplicateCriteria={dropZone ? undefined : duplicateCriteria}
                  deleteCriteria={dropZone ? undefined : deleteCriteria}
                  editCriteria={dropZone ? undefined : (item: SelectedCriteriaType) => editCriteria(item, itemId)}
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
  const { request, criteria } = useAppSelector((state) => state.cohortCreation || {})

  const [parentId, setParentId] = useState<number | null>(null)
  const [openDrawer, setOpenDrawer] = useState<'criteria' | null>(null)
  const [selectedCriteria, setSelectedCriteria] = useState<SelectedCriteriaType | null>(null)
  const { criteriaGroup = [], temporalConstraints } = request
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

  useEffect(() => {
    console.log('test temporal constraints', temporalConstraints)
  }, [temporalConstraints])

  const checkTemporalConstraints = () => {
    console.log('test temporal constraints', temporalConstraints)
  }

  const onDragEnd = (event: DragEndEvent, ids: UniqueIdentifier[]) => {
    const { active, over } = event
    if (!over || active.id === over.id) return
    const activeIndex = ids.indexOf(active.id)
    const overIndex = ids.indexOf(over.id)
    ids.splice(activeIndex, 1)
    ids.splice(overIndex, 0, active.id)
    /* const newGroups: CriteriaGroup[] = criteriaGroup.map((group) => {
      const startIndex = ids.findIndex((id) => id === `start-${group.id}`)
      const endIndex = ids.findIndex((id) => id === `end-${group.id}`)
      const newIds = ids.slice(startIndex + 1, endIndex) as number[]
      const previousIds = group.criteriaIds.filter((id) => id < 0)
      return { ...group, criteriaIds: [...newIds, ...previousIds] }
    })*/
    //dispatch(editAllCriteriaGroup(newGroups))
    //_buildCohortCreation()
    //
    const currentParent = request.criteriaGroup
      ? request.criteriaGroup.find(({ id }) => id === over.data.current?.groupId)
      : null
    if (currentParent) {
      const startIndex = ids.findIndex((id) => id === `start-${currentParent.id}`)
      const endIndex = ids.findIndex((id) => id === `end-${currentParent.id}`)
      const newIds = ids.slice(startIndex + 1, endIndex) as number[]
      const previousIds = currentParent.criteriaIds.filter((id) => id < 0)
      const item = { ...active.data.current, id: active.id }
      delete item['sortable']
      delete item['groupId']
      console.log('test move newIds', currentParent.id, [...newIds, ...previousIds])
      dispatch(deleteSelectedCriteria(active.id as number))
      dispatch(addNewSelectedCriteria(item as SelectedCriteriaType))
      dispatch(
        editCriteriaGroup({
          ...currentParent,
          criteriaIds: [...newIds, ...previousIds]
        })
      )
      _buildCohortCreation()

      /* dispatch(
        editCriteriaGroup({
          ...currentParent,
          criteriaIds: [...newIds, ...previousIds]
        })
      )*/
      //_onConfirmAddOrEditCriteria({ ...(active.data.current as SelectedCriteriaType), id: undefined })
      //_buildCohortCreation()
    }
  }

  return (
    <>
      <DndContext onDragEnd={(event) => onDragEnd(event, criteriasIds)} sensors={sensors}>
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
