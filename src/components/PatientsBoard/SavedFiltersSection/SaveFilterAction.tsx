import React, { useState } from 'react'
import { Grid, Tooltip, Button } from '@mui/material'
import { Save } from '@mui/icons-material'
import Modal from 'components/ui/Modal'
import Text from 'components/ui/Inputs/Text'
import { useForm } from 'react-hook-form'

type SaveFilterActionProps = {
  disabled?: boolean
  onSubmit: (name: string) => void
}

const SaveFilterAction = ({ disabled = false, onSubmit }: SaveFilterActionProps) => {
  const [toggleModal, setToggleModal] = useState(false)
  const {
    getValues,
    register,
    handleSubmit,
    formState: { errors, isDirty, isValid }
  } = useForm<{name: string}>()

  return (
    <>
      <Tooltip title="" /*title={maintenanceIsActive ? "Ce bouton est desactivé en fonction d'une maintenance." : ''}*/>
        <Grid container>
          <Button
            sx={{ borderRadius: 25 }}
            size="small"
            variant="contained"
            fullWidth
            startIcon={<Save height="15px" fill="#FFF" />}
            onClick={() => setToggleModal(true)}
            color="secondary"
            disabled={disabled}
          >
            Enregistrer filtres
          </Button>
        </Grid>
      </Tooltip>
      <Modal
        title="Sauvegarder le filtre"
        color="secondary"
        open={toggleModal}
        readonly={false}
        //readonly={disabled || !isDirty}
        onClose={() => setToggleModal(false)}
        onSubmit={handleSubmit((data) => console.log(data))}
        //isError={!isValid}
      >
        <Text
          {...register('name', {
            required: 'Ce champ est requis.',
            minLength: {
              value: 2,
              message: 'Le texte doit contenir au moins 2 caractères.'
            },
            maxLength: {
              value: 50,
              message: 'Le texte ne peut pas dépasser 50 caractères.'
            }
          })}
          //  errorMessage={errors.textInput?.message}
          placeholder="Choisir un nom compris entre 2 et 50 caractères"
        />
      </Modal>
    </>
  )
}

export default SaveFilterAction
