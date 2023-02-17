import React, { useState, useEffect } from 'react'

import { Grid, Button, Badge } from '@material-ui/core'

import { useAppSelector } from 'state'

import TemporalConstraintModal from './components/TemporalConstraintModal/TemporalConstraintModal'
import useStyles from './styles'

const TemporalConstraint: React.FC = () => {
  const [modalIsOpen, setModalIsOpen] = useState(false)
  const [temporalConstraintExist, setTemporalConstraintExist] = useState(false)

  const { temporalConstraints, json } = useAppSelector((state) => state.cohortCreation.request)

  const classes = useStyles()

  console.log('temporalConstraints', temporalConstraints)
  console.log('json', json)

  useEffect(() => {
    if (temporalConstraints.length > 0) {
      setTemporalConstraintExist(true)
    } else {
      setTemporalConstraintExist(false)
    }
  }, [temporalConstraints])

  const handleOnClose = () => void setModalIsOpen(false)

  const handleOnClick = () => {
    setModalIsOpen(true)
  }

  return (
    <>
      <Grid
        className={classes.root}
        style={{
          backgroundColor: temporalConstraintExist ? '#FFE2A9' : '#DEDEDE'
        }}
      >
        <Badge badgeContent={temporalConstraints.length} color="secondary" />
        <Button onClick={handleOnClick}>Contrainte Temporelle</Button>
      </Grid>
      {modalIsOpen && <TemporalConstraintModal open={modalIsOpen} onClose={handleOnClose} />}
    </>
  )
}

export default TemporalConstraint
