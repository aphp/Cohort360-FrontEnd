import { Autocomplete, AutocompleteRenderGroupParams, Checkbox, Grid, TextField, Typography } from '@mui/material'
import { InputWrapper } from 'components/ui/Inputs/styles'
import { FormContext } from 'components/ui/Modal'
import React, { useContext, useEffect, useState } from 'react'
import { SimpleCodeType } from 'types'

type DocTypesFilterProps = {
  allDocTypesList: SimpleCodeType[]
  value: SimpleCodeType[]
  name: string
  disabled?: boolean
}

const DocTypesFilter = ({ name, value, allDocTypesList, disabled = false }: DocTypesFilterProps) => {
  const context = useContext(FormContext)
  const [selectedDocTypes, setSelectedDocTypes] = useState<SimpleCodeType[]>(value)

  const renderDocTypes = (docType: AutocompleteRenderGroupParams) => {
    const currentDocTypeList = allDocTypesList ? allDocTypesList.filter((doc) => doc.type === docType.group) : []
    const currentSelectedDocTypeList = selectedDocTypes
      ? selectedDocTypes.filter((doc) => doc.type === docType.group)
      : []

    const onClick = () => {
      if (currentDocTypeList.length === currentSelectedDocTypeList.length) {
        setSelectedDocTypes(selectedDocTypes.filter((doc) => doc.type !== docType.group))
      } else {
        setSelectedDocTypes(
          [...selectedDocTypes, ...currentDocTypeList].filter((item, index, array) => array.indexOf(item) === index)
        )
      }
    }

    return (
      <React.Fragment>
        <Grid container direction="row" alignItems="center">
          <Checkbox
            indeterminate={
              currentDocTypeList.length !== currentSelectedDocTypeList.length && currentSelectedDocTypeList.length > 0
            }
            checked={currentDocTypeList.length === currentSelectedDocTypeList.length}
            onClick={onClick}
          />
          <Typography onClick={onClick} noWrap style={{ cursor: 'pointer', width: 'calc(100% - 150px' }}>
            {docType.group}
          </Typography>
        </Grid>
        {docType.children}
      </React.Fragment>
    )
  }

  useEffect(() => {
    if (context?.updateFormData) context.updateFormData(name, selectedDocTypes)
  }, [selectedDocTypes])

  return (
    <InputWrapper>
      <Typography variant="h3">Type de documents :</Typography>
      <Autocomplete
        disabled={disabled}
        multiple
        onChange={(event, value) => {
          setSelectedDocTypes(value)
        }}
        groupBy={(doctype) => doctype.type}
        options={allDocTypesList}
        value={selectedDocTypes}
        disableCloseOnSelect
        getOptionLabel={(docType) => docType.label}
        renderGroup={(docType: AutocompleteRenderGroupParams) => {
          return renderDocTypes(docType)
        }}
        renderOption={(props, docType: SimpleCodeType) => {
          return <li {...props}>{docType.label}</li>
        }}
        renderInput={(params) => <TextField {...params} placeholder="Types de documents" />}
      />
    </InputWrapper>
  )
}

export default DocTypesFilter
