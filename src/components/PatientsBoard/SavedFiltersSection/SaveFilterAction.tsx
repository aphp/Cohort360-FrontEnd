import React, { useState } from 'react'
import { Grid, Tooltip, Button } from '@mui/material'
import { Save } from '@mui/icons-material'
import Modal from 'components/ui/Modal'
import { useForm } from 'hooks/useForm'
import Text from 'components/ui/Inputs/Text'

type SaveFilterActionProps = {
  disabled?: boolean
  onSubmit: (name: string) => void
}

const InputKey = 'filtersName'

const SaveFilterActionProps = ({ disabled = false, onSubmit }: SaveFilterActionProps) => {
  const {
    inputs: { filtersName },
    changeInput
  } = useForm({ [InputKey]: '' })
  const [toggleModal, setToggleModal] = useState(false)

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
        onClose={() => setToggleModal(false)}
        onSubmit={() => {
          onSubmit(filtersName)
          setToggleModal(false)
        }}
        isError={
          filtersName.length < 2 || filtersName.length > 50 /*||
          savedFiltersErrors.isError*/
        }
      >
        <Text
          placeholder="Choisir un nom compris entre 2 et 50 caractères"
          minLimit={2}
          maxLimit={50}
          onChange={(value) => {
            changeInput(InputKey, value)
            //resetSavedFilterError()
          }}
        />
        {/*savedFiltersErrors.isError && <ErrorMessage>{savedFiltersErrors.errorMessage}</ErrorMessage>*/}
      </Modal>
    </>
  )
}

export default SaveFilterActionProps
