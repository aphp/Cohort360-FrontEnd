import React, { useContext, useEffect, useState } from 'react'
import { FormContext } from 'components/ui/Modal/Modal'
import Select from 'components/ui/Searchbar/Select'
import { Order, orderByListPatients } from 'types/searchCriterias'

type OrderByFilterProps = {
  orderByValue: Order
  name: string
}

const OrderByFilter = ({ orderByValue, name }: OrderByFilterProps) => {
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
      items={orderByListPatients}
      onchange={(newOrderBy) => setOrderBy(newOrderBy)}
    />
  )
}

export default OrderByFilter
