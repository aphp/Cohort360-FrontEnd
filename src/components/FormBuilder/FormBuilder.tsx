import React, { useRef, createRef } from 'react'
import { useForm, Controller, UnpackNestedValue, DeepPartial } from 'react-hook-form'
import { Grid, Button, Typography, FormLabel } from '@material-ui/core'

import TextInput from './FormInputs/TextInput'
import SelectInput from './FormInputs/SelectInput'
import DateInput from './FormInputs/DateInput'
import SliderInput from './FormInputs/SliderInput'
import AutocompleteInput from './FormInputs/AutocompleteInput'

import { FormInput as FormInputType } from './InputTypes'

export type FormProps<K extends Record<string, any> = Record<string, any>> = {
  properties: FormInputType<K>[]
  submit: (data: K) => void
  title?: string
  formId?: string
  defaultValues?: UnpackNestedValue<DeepPartial<K>>
  children?: any
  noSubmitButton?: boolean
}

const Form = <K extends Record<string, any> = Record<string, any>>({
  properties,
  submit,
  title,
  formId,
  defaultValues,
  noSubmitButton,
  ...props
}: FormProps<K>) => {
  const { handleSubmit, register, errors, control } = useForm<K>({
    defaultValues
  })

  const controlledProperties = properties.filter(
    (property) => property.type === 'select' || property.type === 'autocomplete' || property.type === 'slider'
  )

  const inputRefs = useRef(controlledProperties.map(() => createRef<HTMLInputElement>()))

  return (
    <form id={formId} onSubmit={handleSubmit(submit)} style={{ padding: 16, height: '100%' }}>
      <Grid container spacing={2} direction="column" style={{ height: '100%' }}>
        <Grid item>
          <Typography variant="subtitle1">{title}</Typography>
        </Grid>

        {properties.map((property) => {
          let input: JSX.Element | null = null
          switch (property.type) {
            case 'label': {
              input = <FormLabel component="legend">{property.label}</FormLabel>
              break
            }

            case 'number':
            case 'text': {
              input = (
                <TextInput
                  type={property.type}
                  title={property.label}
                  // @ts-ignore
                  name={property.name}
                  containerStyle={property.containerStyle}
                  inputRef={register(property.options)}
                  placeholder={property.placeholder}
                  variant={property.variant}
                  error={undefined !== errors[property.name]}
                  helperText={
                    //@ts-ignore
                    errors[property.name] && errors[property.name].message
                  }
                />
              )
              break
            }

            case 'select': {
              input = (
                <Controller
                  //@ts-ignore
                  name={property.name}
                  //@ts-ignore
                  control={control}
                  onFocus={() => {
                    const inputRefIndex = controlledProperties.indexOf(property)
                    inputRefs.current[inputRefIndex]?.current?.focus()
                  }}
                  rules={property.options}
                  render={({ onChange, value, name }) => (
                    <SelectInput
                      name={name}
                      containerStyle={property.containerStyle}
                      title={property.label}
                      //@ts-ignore
                      inputRef={inputRefs.current[0]}
                      value={value ?? ''}
                      onChange={onChange}
                      error={undefined !== errors[property.name]}
                      helperText={
                        //@ts-ignore
                        errors[property.name] && errors[property.name].message
                      }
                      options={property.selectOptions}
                    />
                  )}
                />
              )
              break
            }

            case 'date': {
              input = (
                <Controller
                  //@ts-ignore
                  name={property.name}
                  //@ts-ignore
                  control={control}
                  render={({ ref, ...props }) => (
                    <DateInput
                      {...props}
                      //@ts-ignore
                      inputRef={ref}
                      label={property.label}
                      error={undefined !== errors[property.name]}
                      helperText={
                        //@ts-ignore
                        errors[property.name] && errors[property.name].message
                      }
                    />
                  )}
                />
              )
              break
            }

            case 'autocomplete': {
              input = (
                <Controller
                  //@ts-ignore
                  name={property.name}
                  //@ts-ignore
                  control={control}
                  onFocus={() => {
                    const inputRefIndex = controlledProperties.indexOf(property)
                    inputRefs.current[inputRefIndex]?.current?.focus()
                  }}
                  rules={property.options}
                  render={({ onChange, value, name }) => (
                    <AutocompleteInput
                      name={name}
                      containerStyle={property.containerStyle}
                      value={value || null}
                      title={property.label}
                      //@ts-ignore
                      inputRef={inputRefs.current[0]}
                      onChange={onChange}
                      error={undefined !== errors[property.name]}
                      helperText={
                        //@ts-ignore
                        errors[property.name] && errors[property.name].message
                      }
                      options={property.autocompleteOptions}
                      variant={property.variant}
                    />
                  )}
                />
              )
              break
            }
            case 'slider': {
              input = (
                <Controller
                  //@ts-ignore
                  name={property.name}
                  //@ts-ignore
                  control={control}
                  rules={property.options}
                  render={({ ref, onChange, value, name }) => (
                    <SliderInput
                      name={name}
                      minValue={property.minValue}
                      maxValue={property.maxValue}
                      containerStyle={property.containerStyle}
                      value={value || null}
                      title={property.label}
                      //@ts-ignore
                      inputRef={ref}
                      onChange={onChange}
                      error={undefined !== errors[property.name]}
                      helperText={
                        //@ts-ignore
                        errors[property.name] && errors[property.name].message
                      }
                    />
                  )}
                />
              )
              break
            }

            default:
              break
          }

          return (
            //@ts-ignore
            <Grid item key={property.name}>
              {input}
            </Grid>
          )
        })}

        {!noSubmitButton && <Button type="submit">Submit</Button>}
      </Grid>
    </form>
  )
}

export default Form
