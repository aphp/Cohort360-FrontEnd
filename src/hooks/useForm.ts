import { useMemo, useState } from 'react'

type InputValue<T> = {
  isError: boolean
  value: T
}

type Inputs<T> = {
  [key in keyof T]: InputValue<T[key]>
}

export const useForm = <T extends object>(values: T) => {
  const [inputs, setInputs] = useState<Inputs<T>>(
    Object.fromEntries(Object.entries(values).map(([key, value]) => [key, { value, isError: false }])) as Inputs<T>
  )
  const [hasErrors, setHasErrors] = useState(false)

  const inputsValues = useMemo(() => {
    return Object.fromEntries(
      Object.entries(inputs).map(([key, value]) => [key, (value as InputValue<T[keyof T]>).value])
    )
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
