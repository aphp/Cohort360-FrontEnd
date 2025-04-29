import React, { useEffect, useMemo, useRef } from 'react'
import CheckboxGroup from 'components/ui/Inputs/CheckboxGroup'
import DurationRange from 'components/ui/Inputs/DurationRange'
import { FilterByDocumentStatus, FilterKeys, Filters, genderOptions, vitalStatusesOptions } from 'types/searchCriterias'
import { Controller, ControllerRenderProps, FieldValues, useForm } from 'react-hook-form'
import ValueSets from 'components/ui/Inputs/ValueSets'
import CalendarRange from 'components/ui/Inputs/CalendarRange'
import ExecutiveUnits from 'components/ui/Inputs/ExecutiveUnits'
import { SourceType } from 'types/scope'
import TextInput from 'components/ui/Inputs/Text'
import MultiSelect from 'components/ui/Inputs/MultiSelect'
import allDocTypesList from 'assets/docTypes.json'
import DocTypes from 'components/ui/Inputs/DocTypes'
import { AdditionalInfo } from 'types/exploration'
import { Typography } from '@mui/material'
import { isEqual } from 'lodash'

type ExplorationFiltersProps<T> = {
  filters: T
  infos: AdditionalInfo
  onChange: (filters: T) => void
  onError: (isError: boolean) => void
  hasChanged: (hasChange: boolean) => void
}

enum Source {
  AREM = 'AREM',
  ORBIS = 'ORBIS'
}
const biologyStatusOptions = [
  {
    id: 'validatedStatus',
    label: "N'afficher que les analyses dont les résultats ont été validés"
  }
]

const documentsStatusOptions = [
  {
    id: 'onlyPdfAvailable',
    label: "N'afficher que les documents dont les PDF sont disponibles"
  }
]

const sourceOptions = [
  {
    id: Source.AREM,
    label: Source.AREM
  },
  {
    id: Source.ORBIS,
    label: Source.ORBIS
  }
]

const docStatusesList = [
  { id: FilterByDocumentStatus.VALIDATED, label: FilterByDocumentStatus.VALIDATED },
  { id: FilterByDocumentStatus.NOT_VALIDATED, label: FilterByDocumentStatus.NOT_VALIDATED }
]

const ExplorationFilters = <T extends FieldValues>({
  filters,
  infos,
  onChange,
  onError,
  hasChanged
}: ExplorationFiltersProps<T>) => {
  const {
    control,
    handleSubmit,
    reset,
    getValues,
    formState: { isSubmitting }
  } = useForm<T>({
    defaultValues: filters,
    mode: 'onChange',
    reValidateMode: 'onChange'
  })

  const lastSubmitted = useRef<T>(filters)

  // Réinitialise les valeurs et soumet dès que filters changent
  useEffect(() => {
    reset(filters)
    lastSubmitted.current = filters
    handleSubmit(onChange)()
  }, [filters, reset, handleSubmit, onChange])

  // Sur chaque changement interne, compare et soumet uniquement si ça a vraiment changé
  useEffect(() => {
    const interval = setInterval(() => {
      const currentValues = getValues()
      if (!isEqual(currentValues, lastSubmitted.current) && !isSubmitting) {
        lastSubmitted.current = currentValues
        handleSubmit(onChange)()
        hasChanged(true)
      }
    }, 300)

    return () => clearInterval(interval)
  }, [getValues, handleSubmit, onChange, hasChanged, isSubmitting])

  const fields: Partial<Record<FilterKeys, React.FC<{ field: ControllerRenderProps }>>> = useMemo(
    () => ({
      [FilterKeys.VALIDATED_STATUS]: ({ field }) => (
        <CheckboxGroup {...field} value={['validatedStatus']} options={biologyStatusOptions} disabled />
      ),
      [FilterKeys.ONLY_PDF_AVAILABLE]: ({ field }) => (
        <CheckboxGroup
          onChange={(newValue) => field.onChange(newValue.includes('onlyPdfAvailable'))}
          value={field.value ? ['onlyPdfAvailable'] : []}
          options={documentsStatusOptions}
        />
      ),
      [FilterKeys.GENDERS]: ({ field }) => <CheckboxGroup {...field} label="Genre :" options={genderOptions} />,
      [FilterKeys.VITAL_STATUSES]: ({ field }) => (
        <CheckboxGroup {...field} label="Statut vital :" options={vitalStatusesOptions} />
      ),
      [FilterKeys.BIRTHDATES]: ({ field }) => (
        <DurationRange {...field} label="Âge :" includeDays={!infos.deidentified} onError={onError} />
      ),
      [FilterKeys.NDA]: ({ field }) => (
        <TextInput {...field} label="NDA :" placeholder="Exemple: 6601289264,141740347" />
      ),
      [FilterKeys.IPP]: ({ field }) => (
        <TextInput {...field} label="IPP :" placeholder="Exemple: 8000000000001,8000000000002" />
      ),
      [FilterKeys.DOC_STATUSES]: ({ field }) => (
        <MultiSelect
          {...field}
          options={docStatusesList}
          label="Statut de documents :"
          placeholder="Statut de documents"
        />
      ),
      [FilterKeys.DOC_TYPES]: ({ field }) => (
        <DocTypes {...field} options={allDocTypesList.docTypes} label="Type de documents :" />
      ),
      [FilterKeys.PRESCRIPTION_TYPES]: ({ field }) =>
        field.value ? (
          <MultiSelect
            {...field}
            options={infos.prescriptionList ?? []}
            label="Type de prescriptions :"
            placeholder="Type de prescriptions"
          />
        ) : null,
      [FilterKeys.ADMINISTRATION_ROUTES]: ({ field }) =>
        field.value ? (
          <MultiSelect
            {...field}
            options={infos.administrationList ?? []}
            label="Voie d'administration :"
            placeholder="Voie d'administration"
          />
        ) : null,
      [FilterKeys.CODE]: ({ field }) => <ValueSets {...field} label="Codes :" references={infos.references ?? []} />,
      [FilterKeys.DIAGNOSTIC_TYPES]: ({ field }) =>
        field.value ? (
          <MultiSelect
            {...field}
            options={infos.diagnosticTypesList?.map((e) => ({ id: e.id, label: `${e.id} - ${e.label}` })) ?? []}
            label="Type de diagnostics :"
            placeholder="Type de diagnostics"
          />
        ) : null,
      [FilterKeys.SOURCE]: ({ field }) =>
        field.value ? <CheckboxGroup {...field} label="Source :" options={sourceOptions} /> : null,
      [FilterKeys.FORM_NAME]: ({ field }) => (
        <CheckboxGroup {...field} label="Formulaire :" options={infos.questionnaires ?? []} />
      ),
      [FilterKeys.MODALITY]: ({ field }) => (
        <MultiSelect {...field} options={infos.modalities ?? []} label="Modalités :" placeholder="Modalités" />
      ),
      [FilterKeys.DURATION_RANGE]: ({ field }) => <CalendarRange {...field} label="Date :" onError={onError} />,
      [FilterKeys.EXECUTIVE_UNITS]: ({ field }) => (
        <ExecutiveUnits
          {...field}
          label={<Typography variant="h3">Unité exécutrice :</Typography>}
          sourceType={infos.sourceType ?? SourceType.ALL}
        />
      ),
      [FilterKeys.ENCOUNTER_STATUS]: ({ field }) => (
        <MultiSelect
          {...field}
          options={infos.encounterStatusList ?? []}
          label="Statut de la visite associée :"
          placeholder="Statut de la visite associée"
        />
      )
    }),
    [infos, onError]
  )

  return Object.keys(filters)
    .filter((key) => key in fields)
    .map((key) => (
      <Controller key={key} name={key as keyof Filters} control={control} render={fields[key as keyof Filters]} />
    ))
}

export default ExplorationFilters
