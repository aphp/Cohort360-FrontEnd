import { useState } from 'react'
import { T } from 'vitest/dist/chunks/environment.C5eAp3K6'

type InputName = string

type Inputs<T> = {
  [key in InputName]: T
}

export const useForm = <T>(values: Inputs<T>) => {
  const [inputs, setInputs] = useState(values)

  const changeInput = <T>(name: string, value: T) => {
    const newInputs = { ...inputs }
    newInputs[name] = value
    setInputs(newInputs)
  }

  return {
    changeInput
  }
}
