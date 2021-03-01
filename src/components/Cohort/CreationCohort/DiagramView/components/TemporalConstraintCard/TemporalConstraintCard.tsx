import React, { useState } from 'react'
import { Card, CardHeader, CardContent, Typography, Button } from '@material-ui/core'

import TemporalConstraintModal from './components/TemporalConstraintModal/TemporalConstraintModal'
import useStyles from './styles'

const TemporalConstraintView: React.FC = () => {
  const classes = useStyles()
  const [openModal, onSetOpenModal] = useState<'open' | null>(null)

  return (
    <>
      <Card className={classes.card}>
        <CardHeader className={classes.cardHeader} title="Choisir une contrainte temporelle" />
        <CardContent>
          <>
            <Typography align="center">Ajouter une contrainte temporelle</Typography>
            <div className={classes.actionButtonContainer}>
              <Button
                onClick={() => onSetOpenModal('open')}
                variant="contained"
                color="primary"
                className={classes.actionButton}
              >
                <Typography variant="h5">Contrainte temporelle</Typography>
              </Button>
            </div>
          </>
        </CardContent>
      </Card>

      {openModal === 'open' && <TemporalConstraintModal onClose={() => onSetOpenModal(null)} />}
    </>
  )
}

// const [currentTemporalConstraint, onChangeTemporalConstraint] = useState<TemporalConstraintType>(initialState)

// <Select
//   className={classes.selectTemporalConstraint}
//   variant="outlined"
//   value={currentTemporalConstraint.type}
//   onChange={(e) => onChangeTemporalConstraint({ ...currentTemporalConstraint, type: e.target.value })}
// >
//   <MenuItem value={'SameEncounter'}>est dans le même séjour que</MenuItem>
//   <MenuItem value={'differentEncounter'}>est dans un séjour différent de</MenuItem>
//   <MenuItem value={'directChronologicalOrdering'}>se passe avant</MenuItem>
//   <MenuItem value={'directChronologicalOrderingWithDuration'}>est séparé de x temps de</MenuItem>
// </Select>

export default TemporalConstraintView
