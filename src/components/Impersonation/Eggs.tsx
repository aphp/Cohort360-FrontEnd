import React, { useEffect, useState } from 'react'
import './style.css'
import { JToolEggProps, withJTool } from './JTool'
import JohnTravolta from 'assets/images/johntravolta.gif'
import { Button, Dialog, DialogActions, DialogContent, Typography } from '@mui/material'

const Egg1 = (props: JToolEggProps) => {
  const { clickCount } = props
  const [showMe, setShowMe] = useState(false)

  useEffect(() => {
    if (clickCount > 0) {
      setShowMe(true)
      const timeout = setTimeout(() => setShowMe(false), 6000)
      return () => clearTimeout(timeout)
    }
  }, [clickCount])

  if (!showMe) return null
  return (
    <div className="bounce-in-right" style={{ position: 'fixed', bottom: '0', left: 0, zIndex: 9999 }}>
      <img src={JohnTravolta} alt="John Travolta gif" />
    </div>
  )
}

const Egg2 = (props: JToolEggProps) => {
  const { clickCount, wrappedComponent } = props
  const [showMe, setShowMe] = useState(false)
  const [confirmation, setConfirmation] = React.useState(0)
  const confirmationText = [
    'Etes vous sur de vouloir executer cette action?',
    'Voulez-vous vraiment continuer?',
    'VRAIMENT SUR ?',
    'Dernière chance, êtes-vous sûr ?',
    'Vous êtes un fou furieux, vous êtes sûr ?',
    'Nan mais sérieux, vous êtes sûr ?',
    'Bon, je ne vous retiens pas, mais vous êtes sûr ?'
  ]

  const handleClose = () => {
    setConfirmation(0)
    setShowMe(false)
  }

  useEffect(() => {
    if (clickCount > 0) {
      setShowMe(true)
    }
  }, [clickCount])

  const handleConfirm = () => {
    if (confirmation === confirmationText.length - 1) {
      setShowMe(false)
      console.log(wrappedComponent)
      if (!!wrappedComponent?.props.onClick) {
        wrappedComponent?.props.onClick()
      }
      setConfirmation(0)
    } else {
      setConfirmation(confirmation + 1)
    }
  }

  return (
    <Dialog open={showMe} onClose={handleClose} fullWidth maxWidth="md" aria-labelledby="form-dialog-title">
      <DialogContent>
        <div style={{ margin: '2em', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <Typography variant="h2">{confirmationText[confirmation % confirmationText.length]}</Typography>
        </div>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Annuler</Button>
        <Button onClick={handleConfirm}>Valider</Button>
      </DialogActions>
    </Dialog>
  )
}

export const JEgg1 = withJTool(Egg1)
export const JEgg2 = withJTool(Egg2)
