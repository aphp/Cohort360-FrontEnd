import React, { useEffect, useState } from 'react'
import { Grid, Tooltip, Button } from '@mui/material'
import { Save } from '@mui/icons-material'
import Modal from 'components/ui/Modal'
import Text from 'components/ui/Inputs/Text'
import { Controller, useForm } from 'react-hook-form'
import { ErrorType } from 'types/error'

type SaveFilterActionProps = {
  disabled?: boolean
  onSubmit: (name: string) => void
}

const SaveFilterAction = ({ disabled = false, onSubmit }: SaveFilterActionProps) => {
  const [toggleModal, setToggleModal] = useState(false)
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isValid, isDirty }
  } = useForm<{ name: string }>({
    mode: 'onChange',
    reValidateMode: 'onChange'
  })

  useEffect(() => {
    reset({ name: '' })
  }, [toggleModal])

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
        readonly={disabled}
        onClose={() => setToggleModal(false)}
        onSubmit={handleSubmit((data) => {
          onSubmit(data.name)
          setToggleModal(false)
          reset()
        })}
        isError={!isValid}
      >
        <Controller
          name="name"
          control={control}
          rules={{
            required: 'Ce champ est requis.',
            minLength: {
              value: 2,
              message: 'Le nom doit contenir au moins 2 caractères.'
            },
            maxLength: {
              value: 50,
              message: 'Le nom ne peut pas dépasser 50 caractères.'
            }
          }}
          render={({ field }) => (
            <Text
              {...field}
              label="Nom :"
              placeholder="Choisir un nom compris entre 2 et 50 caractères"
              errorMessage={isDirty ? errors.name?.message : ''}
            />
          )}
        />
      </Modal>
    </>
  )
}

export default SaveFilterAction
