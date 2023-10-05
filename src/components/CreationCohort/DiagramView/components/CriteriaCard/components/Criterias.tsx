import { ChipWrapper } from 'components/ui/Chips/styles'
import React from 'react'
import { SelectedCriteriaType } from 'types'
import { RequestCriteriasKeys } from 'types/requestCriterias'
import { getDurationRangeLabel } from 'utils/age'
import { getBirthdates, getDeathDates, getGenders, getVitalStatusLabel } from 'utils/requestCriterias'

type CriteriasProps = {
  value: any //SelectedCriteriaType
}

const Criterias = ({ value }: CriteriasProps) => {
  return (
    <>
      {value[RequestCriteriasKeys.GENDERS]?.length > 0 && <ChipWrapper label={getGenders(value.genders)} />}
      {value[RequestCriteriasKeys.VITAL_STATUS] && <ChipWrapper label={getVitalStatusLabel(value.vitalStatus)} />}
      {value[RequestCriteriasKeys.AGE] && <ChipWrapper label={getDurationRangeLabel(value.age)} />}
      {(value[RequestCriteriasKeys.BIRTHDATES][0] !== null || value[RequestCriteriasKeys.BIRTHDATES][1] !== null) && (
        <ChipWrapper label={getBirthdates(value.birthdates)} />
      )}
      {(value[RequestCriteriasKeys.DEATH_DATES][0] !== null || value[RequestCriteriasKeys.DEATH_DATES][1] !== null) && (
        <ChipWrapper label={getDeathDates(value.deathDates)} />
      )}
    </>
  )
}

export default Criterias
