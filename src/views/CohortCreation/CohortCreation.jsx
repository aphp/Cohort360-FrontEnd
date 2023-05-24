import React from 'react'
import clsx from 'clsx'
import { useSelector } from 'react-redux'

import Requeteur from 'components/CreationCohort/Requeteur'
import useStyles from './styles'

const CohortCreation = () => {
  const { classes } = useStyles()

  const open = useSelector((state) => state.drawer)

  return (
    <div position="fixed" className={clsx(classes.appBar, { [classes.appBarShift]: open })}>
      <div className={classes.mainContainer}>
        <Requeteur />
      </div>
    </div>
  )
}

export default CohortCreation
