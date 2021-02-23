import React, { useState } from 'react'
import { useDispatch } from 'react-redux'

import { Button, Card, CardHeader, CardContent, CircularProgress, IconButton } from '@material-ui/core'

import AddIcon from '@material-ui/icons/Add'
import DeleteIcon from '@material-ui/icons/Delete'
import EditIcon from '@material-ui/icons/Edit'

import CriteriaCardContent from './components/CriteriaCardContent/CriteriaCardContent'
import GroupRightPanel from './components/GroupRightPanel/GroupRightPanel'
import GroupSeparator from '../GroupSeparator/GroupSeparator'

import { useAppSelector } from 'state'
import { buildCohortCreation, deleteCriteriaGroup, deleteSelectedCriteria } from 'state/cohortCreation'

import useStyles from './styles'

type GroupCardItemProps = {
  itemId: number
}

const GroupCardItem: React.FC<GroupCardItemProps> = ({ itemId }) => {
  const classes = useStyles()

  const { selectedCriteria = [], criteriaGroup = [] } = useAppSelector((state) => state.cohortCreation.request || {})

  const isGroupObject = itemId < 0
  if (!isGroupObject) {
    const CurrentCriterion = selectedCriteria.find((criteria) => criteria.id === itemId)
    if (!CurrentCriterion) return <></> // Bug, not possible ... The current item is not a criteria

    return (
      <Card className={classes.card}>
        <CardHeader
          className={classes.cardHeader}
          style={{ backgroundColor: CurrentCriterion.isInclusive ? '#DAF0BF' : '#FFC695' }}
          title={CurrentCriterion.title}
        />
        <CardContent className={classes.cardContent}>
          <CriteriaCardContent currentCriteria={CurrentCriterion} />
        </CardContent>
      </Card>
    )
  } else {
    const currentGroup = criteriaGroup.find((criteria) => criteria.id === itemId)
    if (!currentGroup) return <></> // Bug, not possible ... The current item is not a group ...

    const { type, criteriaIds } = currentGroup
    return (
      <Card className={classes.card}>
        <CardHeader
          className={classes.cardHeader}
          style={{ backgroundColor: currentGroup.isInclusive ? '#DAF0BF' : '#FFC695' }}
          title={currentGroup.title}
        />

        <CardContent className={classes.cardContent}>
          {criteriaIds.length > 0 &&
            criteriaIds.map((criteriaId, index) => {
              const isLastItem = index === criteriaIds.length - 1
              return (
                <React.Fragment key={criteriaId}>
                  <GroupCardItem itemId={criteriaId} />
                  {!isLastItem && <GroupSeparator groupType={type} />}
                </React.Fragment>
              )
            })}
        </CardContent>
      </Card>
    )
  }
}

const GroupCard: React.FC = () => {
  const classes = useStyles()
  const dispatch = useDispatch()

  const { loading = false, criteriaGroup = [], selectedCriteria = [] } = useAppSelector(
    (state) => state.cohortCreation.request || {}
  )

  const displayingCriteriaGroup = criteriaGroup.filter(({ isSubGroup }) => !isSubGroup)

  const [selectedGroupId, onChangeSelectedGroupId] = useState<number | null>(null)
  const [openGroupDrawer, onChangeOpenGroupDrawer] = useState<boolean>(false)

  const currentCriteriaGroup = selectedGroupId ? criteriaGroup.find(({ id }) => id === selectedGroupId) : undefined

  const _addNewGroup = () => {
    onChangeSelectedGroupId(null)
    onChangeOpenGroupDrawer(true)
  }

  const _editGroup = (groupId: number) => {
    onChangeSelectedGroupId(groupId)
    onChangeOpenGroupDrawer(true)
  }

  const _deleteGroup = (groupId: number) => {
    const deletedCriteriaGroup = criteriaGroup.find(({ id }) => id === groupId)
    const children = deletedCriteriaGroup?.criteriaIds ?? []
    for (const childItemId of children) {
      if (childItemId > 0) {
        dispatch(deleteSelectedCriteria(childItemId))
      } else {
        _deleteGroup(childItemId)
      }
    }
    dispatch(deleteCriteriaGroup(groupId))
  }

  return (
    <>
      {displayingCriteriaGroup.map(({ id, title, criteriaIds, type, isInclusive }) => {
        const isGroupObject = criteriaIds.length > 1
        const firstChild = !isGroupObject ? selectedCriteria.find(({ id }) => id === criteriaIds[0]) : null
        return (
          <React.Fragment key={id}>
            <GroupSeparator />
            <div>
              <Card className={classes.mainCard}>
                <CardHeader
                  className={classes.cardHeader}
                  style={{ backgroundColor: isInclusive ? '#DAF0BF' : '#FFC695' }}
                  title={firstChild ? firstChild.title : title}
                  action={
                    <>
                      <IconButton size="small" onClick={() => _editGroup(id)} style={{ color: 'currentcolor' }}>
                        <EditIcon />
                      </IconButton>
                      <IconButton size="small" onClick={() => _deleteGroup(id)} style={{ color: 'currentcolor' }}>
                        <DeleteIcon />
                      </IconButton>
                    </>
                  }
                />

                {firstChild ? (
                  <CardContent className={classes.cardContent}>
                    <CriteriaCardContent currentCriteria={firstChild} />
                  </CardContent>
                ) : (
                  <CardContent className={classes.cardContent}>
                    {criteriaIds.length > 0 &&
                      criteriaIds.map((criteriaId, index) => {
                        const isLastItem = index === criteriaIds.length - 1
                        return (
                          <React.Fragment key={criteriaId}>
                            <GroupCardItem itemId={criteriaId} />
                            {!isLastItem && <GroupSeparator groupType={type} />}
                          </React.Fragment>
                        )
                      })}
                  </CardContent>
                )}
              </Card>
            </div>
          </React.Fragment>
        )
      })}

      <div className={classes.buttonContainer}>
        <Button
          disabled={loading}
          className={classes.addButton}
          onClick={_addNewGroup}
          variant="contained"
          color="primary"
        >
          {loading ? <CircularProgress className={classes.loading} /> : <AddIcon />}
        </Button>
      </div>

      <GroupRightPanel
        open={openGroupDrawer}
        currentCriteriaGroup={currentCriteriaGroup ?? null}
        onClose={() => {
          onChangeOpenGroupDrawer(false)
          dispatch(buildCohortCreation({}))
        }}
      />
    </>
  )
}

export default GroupCard
