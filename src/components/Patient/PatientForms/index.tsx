import React, { useState } from 'react'
import { Grid } from '@mui/material'
import { BlockWrapper } from 'components/ui/Layout'
import Select from 'components/ui/Searchbar/Select'
import MaternityForm from './MaternityForms'

const formTypes = [
  {
    id: 'maternity',
    label: 'Maternité'
  }
]

const PatientForms = () => {
  const [formType, setFormType] = useState('maternity')

  return (
    <Grid container justifyContent="flex-end">
      <BlockWrapper item xs={12} margin={'20px 0px 0px'}>
        <Select
          value={formType}
          label="Dossiers de Spécialité"
          items={formTypes}
          onchange={(newValue) => setFormType(newValue)}
        />
      </BlockWrapper>
      {formType === 'maternity' && <MaternityForm />}
    </Grid>
  )
}

export default PatientForms
