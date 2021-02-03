import React, { useState } from 'react'

import { Button, CircularProgress } from '@material-ui/core'
// import { Button, Card, CardHeader, CardContent, CircularProgress, IconButton } from '@material-ui/core'

import AddIcon from '@material-ui/icons/Add'

import GroupRightPanel from './components/GroupRightPanel/GroupRightPanel'

import { useAppSelector } from 'state'

import useStyles from './styles'

const GroupCard: React.FC = () => {
  const classes = useStyles()

  const { loading = false } = useAppSelector<{
    loading: boolean
  }>((state) => state.cohortCreation.request || {})

  // const [indexGroup, onChangeIndexGroup] = useState<number | null>(null)
  const [openGroupDrawer, onChangeOpenGroupDrawer] = useState<boolean>(false)

  const _addNewGroup = () => {
    onChangeOpenGroupDrawer(true)
  }

  return (
    <>
      {/* <div className={classes.root}>
        <Card className={classes.card}>
          <CardHeader
            className={classes.cardHeader}
            action={
              <>
                <IconButton size="small" onClick={() => _editGroup(0)} style={{ color: 'currentcolor' }}>
                  <EditIcon />
                </IconButton>
                <IconButton size="small" onClick={() => _deleteGroup(0)} style={{ color: 'currentcolor' }}>
                  <DeleteIcon />
                </IconButton>
              </>
            }
          />
          <CardContent className={classes.cardContent}></CardContent>
        </Card>
      </div> */}

      <div className={classes.root}>
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

      <GroupRightPanel open={openGroupDrawer} onClose={() => onChangeOpenGroupDrawer(false)} />
    </>
  )
}

export default GroupCard
