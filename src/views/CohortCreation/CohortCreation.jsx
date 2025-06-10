import React from 'react'
import { useSelector } from 'react-redux'

import Requeteur from 'components/CreationCohort/Requeteur'
import useStyles from './styles'

const CohortCreation = () => {
  const { classes, cx } = useStyles()

  const open = useSelector((state) => state.drawer)

  return (
    <div
      position="fixed"
      className={cx(classes.appBar, { [classes.appBarShift]: open })}
      style={{ backgroundColor: '#E6F1FD', height: '100vh' }}
    >
      <div className={classes.mainContainer}>
        <Requeteur />
      </div>
    </div>
  )
}

export default CohortCreation
