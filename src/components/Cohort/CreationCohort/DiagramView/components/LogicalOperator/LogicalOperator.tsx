import React, { useState } from 'react'
import { useDispatch } from 'react-redux'

import { ButtonGroup, Button, CircularProgress, Divider, Typography } from '@material-ui/core'

import GroupRightPanel from './components/GroupRightPanel/GroupRightPanel'

import { CriteriaGroupType } from 'types'

import { useAppSelector } from 'state'
import { buildCreationCohort, addNewCriteriaGroup } from 'state/cohortCreation'

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

  const isMainOperator = itemId === 0
  const displayingCriteriaGroup = itemId ? [] : []

  return (
    <>
      {isMainOperator && (
        <Typography variant="h5" className={classes.logicalOperator}>
          ET
        </Typography>
      )}

      {/* {displayingCriteriaGroup &&
        displayingCriteriaGroup.map(({ id, criteriaIds, type, isInclusive }) => (
          <div className={classes.operatorRoot} key={id}></div>
        ))} */}

      <ButtonGroup disableElevation className={classes.buttonContainer} variant="contained" color="primary">
        {loading ? (
          <Button disabled>
            <CircularProgress />
          </Button>
        ) : (
          <>
            <Button color="inherit" onClick={() => addNewCriteria(itemId)}>
              Ajouter un critère
            </Button>
            <Divider orientation="vertical" flexItem style={{ background: 'white', margin: '6px 0' }} />
            <Button color="inherit" onClick={() => addNewGroup(itemId)}>
              Ajouter un opérateur logique
            </Button>
          </>
        )}
      </ButtonGroup>
    </>
  )
}

const GroupOperator: React.FC = () => {
  const classes = useStyles()
  const dispatch = useDispatch()

  const { request } = useAppSelector((state) => state.cohortCreation || {})

  const { loading = false, criteriaGroup = [] } = request

  const [openGroupDrawer, onChangeOpenGroupDrawer] = useState<boolean>(false)

  const _addNewCriteria = (parentId: number) => {
    console.log('parentId ::>', parentId)
  }

  const _addNewGroup = (parentId: number) => {
    console.log('parentId ::>', parentId)
    const newOperator: CriteriaGroupType = {
      id: request.nextGroupId,
      title: `Nouveau opérateur logique ${request.nextGroupId * -1}`,
      type: 'orGroup',
      criteriaIds: [],
      isSubGroup: false,
      isInclusive: true
    }
    dispatch(addNewCriteriaGroup(newOperator))
  }

  return (
    <>
      <OperatorItem itemId={0} addNewCriteria={_addNewCriteria} addNewGroup={_addNewGroup} />

      <GroupRightPanel
        open={openGroupDrawer}
        currentCriteriaGroup={null}
        // currentCriteriaGroup={currentCriteriaGroup ?? null}
        onClose={() => {
          onChangeOpenGroupDrawer(false)
          dispatch(buildCreationCohort({}))
        }}
      />
    </>
  )
}

export default GroupOperator
