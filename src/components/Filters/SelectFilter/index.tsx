import React, { useContext, useEffect, useState } from 'react'
import { FormContext } from 'components/ui/Modal'
import Select from 'components/ui/Searchbar/Select'

type SelectInputProps<T> = {
  value: T
  name: string
  options: {
    id: T
    label: string
  }[]
}

const SelectInput = <T,>({ value, name, options }: SelectInputProps<T>) => {
  const context = useContext(FormContext)
  const [inputs, setInputs] = useState(value)

  useEffect(() => {
    if (context?.updateFormData) context.updateFormData(name, inputs)
  }, [inputs])

  return <Select value={inputs} width={'200px'} label="Trier par :" items={options} onchange={setInputs} />
}

export default SelectInput
