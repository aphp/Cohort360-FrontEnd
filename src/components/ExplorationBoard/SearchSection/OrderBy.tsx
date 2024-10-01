import React, { useState } from 'react'
import Modal from 'components/ui/Modal'
import { SwapVert } from '@mui/icons-material'
import { Button, Grid } from '@mui/material'
import { OrderBy as OrderByType, orderDirection } from 'types/searchCriterias'
import { Controller, useForm } from 'react-hook-form'
import RadioGroup from 'components/ui/RadioGroup'
import Select from 'components/ui/Searchbar/Select'
import { AdditionalInfo } from 'types/exploration'

type OrderByProps = {
  orderBy: OrderByType
  infos: AdditionalInfo
  onSubmit: (orderBy: OrderByType) => void
}

const OrderBy = ({ orderBy, infos, onSubmit }: OrderByProps) => {
  const [toggleModal, setToggleModal] = useState(false)
  const {
    control,
    handleSubmit,
    formState: { isDirty }
  } = useForm<OrderByType>({
    defaultValues: orderBy,
    mode: 'onChange',
    reValidateMode: 'onChange'
  })

  return (
    <>
      <Button
        size="small"
        sx={{ borderRadius: 1 }}
        fullWidth
        startIcon={<SwapVert height="15px" fill="#0288D1" />}
        variant="contained"
        onClick={() => setToggleModal(true)}
        style={{ backgroundColor: '#fff', color: '#303030', height: '30px' }}
      >
        Trier par
      </Button>
      <Modal
        title="Tri des patients :"
        open={toggleModal}
        readonly={!isDirty}
        color="secondary"
        onClose={() => setToggleModal(false)}
        onSubmit={() => {
          handleSubmit(onSubmit)()
          setToggleModal(false)
        }}
      >
        <Grid container justifyContent="space-between" alignItems="center">
          <Grid item xs={5}>
            <Controller
              name="orderBy"
              control={control}
              render={({ field }) => (
                <Select<string | undefined>
                  {...field}
                  label="Trier par :"
                  options={infos.orderByList ?? []}
                  onchange={field.onChange}
                  radius={5}
                />
              )}
            />
          </Grid>
          <Grid item xs={6}>
            <Controller
              name="orderDirection"
              control={control}
              render={({ field }) => <RadioGroup {...field} options={orderDirection} onChange={field.onChange} row />}
            />
          </Grid>
        </Grid>
      </Modal>
    </>
  )
}

export default OrderBy
