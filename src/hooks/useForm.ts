import { useEffect, useMemo, useState } from 'react'

type InputValue<T> = {
  isError: boolean
  value: T
}

type Inputs<T> = {
  [key in keyof T]: InputValue<T[key]>
}

export const useForm = <T extends object>(values: T) => {
  const initializeInputs = (): Inputs<T> => {
    const result = {} as Inputs<T>
    for (const key in values) {
      result[key] = { value: values[key], isError: false }
    }
    return result
  }

  const [inputs, setInputs] = useState<Inputs<T>>(initializeInputs())
  const [hasErrors, setHasErrors] = useState(false)

  useEffect(() => {
    //setInputs(initializeInputs())
  }, [values])

  const inputsValues = useMemo(() => {
    const valuesResult = {} as T
    for (const key in inputs) {
      valuesResult[key] = inputs[key].value
    }
    return valuesResult
  }, [inputs])

  const changeFormError = (hasError: boolean) => setHasErrors(hasError)

  const changeInput = <K extends keyof T>(name: K, value: T[K], isError = false) => {
    setInputs((prev) => ({
      ...prev,
      [name]: { value, isError }
    }))
  }

  return {
    inputs: inputsValues,
    hasErrors,
    changeInput,
    changeFormError
  }
}