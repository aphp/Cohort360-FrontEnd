import React, { useState } from 'react'

import { Button, Card, CardHeader, CardContent, IconButton, Typography } from '@material-ui/core'

import DeleteIcon from '@material-ui/icons/Delete'
import EditIcon from '@material-ui/icons/Edit'

import PopulationRightPanel from './components/PopulationRightPanel'

import { ScopeTreeRow } from 'types'

import useStyles from './styles'

type PopulationCardProps = {
  selectedPopulation: ScopeTreeRow[] | null
  onChangeSelectedPopulation: (selectedPopulation: ScopeTreeRow[] | null) => void
}
const PopulationCard: React.FC<PopulationCardProps> = (props) => {
  const { selectedPopulation, onChangeSelectedPopulation } = props

  const classes = useStyles()

  const [openDrawer, onChangeOpenDrawer] = useState(false)

  const submitPopulation = (_selectedPopulation: ScopeTreeRow[] | null) => {
    onChangeSelectedPopulation(_selectedPopulation)
    onChangeOpenDrawer(false)
  }

  return (
    <>
      <Card className={classes.root}>
        <CardHeader
          className={classes.cardHeader}
          action={
            selectedPopulation !== null && (
              <>
                <IconButton
                  size="small"
                  onClick={() => onChangeSelectedPopulation(null)}
                  style={{ color: 'currentcolor' }}
                >
                  <DeleteIcon />
                </IconButton>
                <IconButton size="small" onClick={() => onChangeOpenDrawer(true)} style={{ color: 'currentcolor' }}>
                  <EditIcon />
                </IconButton>
              </>
            )
          }
          title="Population source"
        />
        <CardContent className={classes.cardContent}>
          {selectedPopulation !== null ? (
            <>
              <Typography align="center">Patients ayant été pris en charge à :</Typography>
              {selectedPopulation &&
                selectedPopulation.slice(0, 3).map((pop: any) => (
                  <Typography key={pop.name} align="center" className={classes.populationLabel}>
                    {pop.name}
                  </Typography>
                ))}
              {selectedPopulation && selectedPopulation.length > 3 && (
                <Typography align="center" className={classes.populationLabel}>
                  ...
                </Typography>
              )}
            </>
          ) : (
            <>
              <Typography align="center">Sur quelle population source souhaitez-vous baser votre requête ?</Typography>

              <div className={classes.actionButtonContainer}>
                <Button
                  onClick={() => onChangeOpenDrawer(true)}
                  variant="contained"
                  color="primary"
                  className={classes.actionButton}
                >
                  Structure hospitalière
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <PopulationRightPanel
        open={openDrawer}
        onConfirm={submitPopulation}
        onClose={() => onChangeOpenDrawer(false)}
        selectedPopulation={selectedPopulation}
      />
    </>
  )
}

export default PopulationCard
