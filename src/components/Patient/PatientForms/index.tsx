import React, { useState } from 'react'
import { Grid } from '@mui/material'
import { BlockWrapper } from 'components/ui/Layout'
import Select from 'components/ui/Searchbar/Select'
import MaternityForm from './MaternityForms'

type PatientFormsProps = {
  groupId?: string
}

const formTypes = [
  {
    id: 'maternity',
    label: 'Maternité'
  }
]

const PatientForms = ({ groupId }: PatientFormsProps) => {
  const [formType, setFormType] = useState('maternity')

  return (
    <Grid container justifyContent="flex-end">
      <BlockWrapper item xs={12} margin={'20px 0px 10px'}>
        <Select value={formType} label="Formulaire" items={formTypes} onchange={(newValue) => setFormType(newValue)} />
      </BlockWrapper>
      {formType === 'maternity' && <MaternityForm groupId={groupId} />}
    </Grid>
  )
}

export default PatientForms
