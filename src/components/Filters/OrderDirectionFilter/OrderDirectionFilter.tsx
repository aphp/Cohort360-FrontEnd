import React, { useContext, useEffect, useState } from 'react'
import { FormContext } from 'components/ui/Modal'
import { Direction, orderDirection as orderDirectionList } from 'types/searchCriterias'
import RadioGroup from 'components/ui/RadioGroup'
import { Grid, Typography } from '@mui/material'

type OrderDirectionFilterProps = {
  orderDirectionValue: Direction
  name: string
}

const OrderDirectionFilter = ({ orderDirectionValue, name }: OrderDirectionFilterProps) => {
  const context = useContext(FormContext)
  const [orderDirection, setOrderDirection] = useState(orderDirectionValue)

  useEffect(() => {
    if (context?.updateFormData) context.updateFormData(name, orderDirection)
  }, [orderDirection])

  return (
    <Grid container item justifyContent="space-around" alignItems="center" xs={7}>
      <Typography variant="button">Ordre :</Typography>
      <RadioGroup
        row
        selectedValue={orderDirection || Direction.ASC}
        items={orderDirectionList}
        onchange={(newOrderDirection) => setOrderDirection(newOrderDirection)}
      />
    </Grid>
  )
}

export default OrderDirectionFilter
