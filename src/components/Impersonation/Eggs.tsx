import React, { useEffect, useState } from 'react'
import './style.css'
import { JToolEggProps } from './JTool'
import JohnTravolta from 'assets/images/johntravolta.gif'
import MindBlown from 'assets/images/mindblown.gif'
import { Button, Dialog, DialogActions, DialogContent, Typography } from '@mui/material'

export const Egg1 = (props: JToolEggProps) => {
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

export const Egg2 = (props: JToolEggProps) => {
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

export const Egg3 = (props: { count?: number }) => {
  const { count } = props
  const [showMe, setShowMe] = useState(true)

  useEffect(() => {
    setShowMe(true)
    const timeout = setTimeout(() => setShowMe(false), 10000)
    return () => clearTimeout(timeout)
  }, [])

  if (!showMe) return null
  return (
    <div style={{ position: 'fixed', bottom: '0', left: '0', width: '100%', height: '100%', zIndex: 9999 }}>
      <div
        style={{
          position: 'absolute',
          width: '100%',
          fontSize: '15em',
          height: '100%',
          textAlign: 'center',
          animation: 'fadeIn 10s ease',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center'
        }}
      >
        {count}
      </div>
      <img
        src={MindBlown}
        style={{ animation: 'fadeInAndOut 10s ease', objectFit: 'cover', width: '100%' }}
        alt="Mind Blown gif"
      />
    </div>
  )
}
