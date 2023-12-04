import React, { useContext, useEffect, useState } from 'react'
import { Checkbox, FormControlLabel, FormGroup, Typography } from '@mui/material'
import { InputWrapper } from 'components/ui/Inputs'
import { FormContext } from 'components/ui/Modal'
import { VitalStatus } from 'types/searchCriterias'
import { isChecked, toggleFilter } from 'utils/filters'

type VitalStatusesFilterProps = {
  value: VitalStatus[]
  name: string
}

const VitalStatusesFilter = ({ name, value }: VitalStatusesFilterProps) => {
  const context = useContext(FormContext)
  const [vitalStatuses, setVitalStatuses] = useState(value)

  useEffect(() => {
    if (context?.updateFormData) context.updateFormData(name, vitalStatuses)
  }, [vitalStatuses])

  return (
    <InputWrapper>
      <Typography variant="h3">Statut vital :</Typography>
      <FormGroup
        onChange={(e) =>
          setVitalStatuses(toggleFilter(vitalStatuses, (e.target as HTMLInputElement).value) as VitalStatus[])
        }
        row
      >
        <FormControlLabel
          checked={isChecked(VitalStatus.ALIVE, vitalStatuses)}
          value={VitalStatus.ALIVE}
          control={<Checkbox color="secondary" />}
          label="Patients vivants"
        />
        <FormControlLabel
          checked={isChecked(VitalStatus.DECEASED, vitalStatuses)}
          value={VitalStatus.DECEASED}
          control={<Checkbox color="secondary" />}
          label="Patients décédés"
        />
      </FormGroup>
    </InputWrapper>
  )
}

export default VitalStatusesFilter
