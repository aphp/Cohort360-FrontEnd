import React from 'react'
import clsx from 'clsx'

import Button from '@mui/material/Button'
import ButtonGroup from '@mui/material/ButtonGroup'

import useStyle from './styles'

type InputSearchDocumentButtonProps = {
  currentMode: 'simple' | 'regex'
  onChangeMode: (newMode: 'simple' | 'regex') => void
}
const InputSearchDocumentButton: React.FC<InputSearchDocumentButtonProps> = ({ currentMode, onChangeMode }) => {
  const classes = useStyle()

  return (
    <ButtonGroup disableElevation className={classes.buttonContainer} size="small" variant="contained">
      <Button
        onClick={() => onChangeMode('simple')}
        className={clsx({
          [classes.activeButton]: currentMode !== 'simple'
        })}
      >
        Recherche simple
      </Button>
      <Button
        onClick={() => onChangeMode('regex')}
        className={clsx({
          [classes.activeButton]: currentMode !== 'regex'
        })}
      >
        Recherche avec regex
      </Button>
    </ButtonGroup>
  )
}

export default InputSearchDocumentButton
