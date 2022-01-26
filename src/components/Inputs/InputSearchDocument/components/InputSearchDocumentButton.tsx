import React from 'react'
import clsx from 'clsx'

import Button from '@material-ui/core/Button'
import ButtonGroup from '@material-ui/core/ButtonGroup'

import useStyle from './styles'

type InputSearchDocumentButtonProps = {
  currentMode: 'simple' | 'regex' | 'extend'
  onChangeMode: (newMode: 'simple' | 'regex' | 'extend') => void
}
const InputSearchDocumentButton: React.FC<InputSearchDocumentButtonProps> = ({ currentMode, onChangeMode }) => {
  const classes = useStyle()

  return (
    <ButtonGroup className={classes.buttonContainer} size="small" variant="contained">
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
