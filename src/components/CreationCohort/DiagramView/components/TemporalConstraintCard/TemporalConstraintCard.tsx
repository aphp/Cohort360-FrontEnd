import React, { useState, useEffect } from 'react'

import { Button, Badge } from '@material-ui/core'

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
      <Badge badgeContent={temporalConstraints.length} color="secondary" style={{ height: 'fit-content' }}>
        <Button
          onClick={handleOnClick}
          className={classes.root}
          style={{
            backgroundColor: temporalConstraintExist ? '#FFE2A9' : '#DEDEDE'
          }}
        >
          Contraintes temporelles
        </Button>
      </Badge>
      {modalIsOpen && <TemporalConstraintModal open={modalIsOpen} onClose={handleOnClose} />}
    </>
  )
}

export default TemporalConstraint
