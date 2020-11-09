import React from 'react'

import Card from '@material-ui/core/Card'
import Slider from '@material-ui/core/Slider'
import Tooltip from '@material-ui/core/Tooltip'

import PropTypes from 'prop-types'

import useStyles from './styles'

const AnonymisationParameter = (props) => {
  const classes = useStyles()
  const marksL = [
    {
      value: 4,
      label: 4
    },
    {
      value: 2,
      label: 2
    },
    {
      value: 3,
      label: 3
    },
    {
      value: 1,
      label: 1
    }
  ]
  const marksK = [
    {
      value: 4,
      label: 4
    },
    {
      value: 5,
      label: 5
    },
    {
      value: 2,
      label: 2
    },
    {
      value: 3,
      label: 3
    }
  ]

  const handleChangeK = (event, newValue) => {
    props.setK(newValue)
  }

  const handleChangeL = (event, newValue) => {
    props.setL(newValue)
  }

  return (
    <Card className={classes.cardAnonymParameters}>
      Paramètres d&apos;anonymisation
      <div className={classes.alignAnonymParameters}>
        <Tooltip
          title="K-anonymity : assure que chaque individu inclus dans le
              dataset anonymisé est indistinguable d'au moins K-1 individus
              également inclus dans le dataset anonymisé (définissant une classe
              d'équivalence)"
          aria-label="add"
        >
          <div className={classes.parameterName}>K-anonymity</div>
        </Tooltip>
        <Slider
          className={classes.sliderAnonymParameters}
          defaultValue={2}
          aria-labelledby="discrete-slider-always"
          step={1}
          min={2}
          max={5}
          marks={marksK}
          valueLabelDisplay="auto"
          onChange={handleChangeK}
        />
      </div>
      <div className={classes.alignAnonymParameters}>
        <Tooltip
          title="L-diversity : assure que chaque classe d'équivalence
              contient au moins L valeurs distinctes d'attributs sensibles"
          aria-label="add"
        >
          <div className={classes.parameterName}>L-diversity</div>
        </Tooltip>
        <Slider
          className={classes.sliderAnonymParameters}
          defaultValue={1}
          aria-labelledby="discrete-slider-always"
          step={1}
          min={1}
          max={4}
          marks={marksL}
          valueLabelDisplay="auto"
          onChange={handleChangeL}
        />
      </div>
    </Card>
  )
}

AnonymisationParameter.propTypes = {
  setL: PropTypes.func.isRequired,
  setK: PropTypes.func.isRequired
}

export default AnonymisationParameter
