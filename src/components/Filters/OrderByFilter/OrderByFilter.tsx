import React, { useContext, useEffect, useState } from 'react'
import { FormContext } from 'components/ui/Modal/Modal'
import Select from 'components/ui/Searchbar/Select'
import { Order } from 'types/searchCriterias'
import { PatientTableLabels } from 'types/patient'

type OrderByFilterProps = {
  orderByValue: Order
  name: string
  items: {
    id: Order
    label: PatientTableLabels
  }[]
}

const OrderByFilter = ({ orderByValue, name, items }: OrderByFilterProps) => {
  const context = useContext(FormContext)
  const [orderBy, setOrderBy] = useState(orderByValue)

  useEffect(() => {
    if (context?.updateFormData) context.updateFormData(name, orderBy)
  }, [orderBy])

  return (
    <Select
      selectedValue={orderBy}
      width={'200px'}
      label="Trier par :"
      items={items}
      onchange={(newOrderBy) => setOrderBy(newOrderBy)}
    />
  )
}

export default OrderByFilter
