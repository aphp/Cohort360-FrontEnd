import React, { useEffect, useState } from 'react'
import { Save } from '@mui/icons-material'
import Modal from 'components/ui/Modal'
import Text from 'components/ui/Inputs/Text'
import { Controller, useForm } from 'react-hook-form'
import Button from 'components/ui/Button'

type SaveFilterProps = {
  disabled?: boolean
  onSubmit: (name: string) => void
}

const SaveFilter = ({ disabled = false, onSubmit }: SaveFilterProps) => {
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
  }, [toggleModal, reset])

  return (
    <>
      <Button
        customVariant="secondary"
        onClick={() => setToggleModal(true)}
        disabled={disabled}
        startIcon={<Save height="15px" fill="#FFF" />}
        width="fit-content"
      >
        Enregistrer
      </Button>
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

export default SaveFilter
