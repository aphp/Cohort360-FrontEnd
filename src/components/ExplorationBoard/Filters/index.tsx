import React, { Fragment, useEffect } from 'react'
import CheckboxGroup from 'components/ui/Inputs/CheckboxGroup'
import DurationRange from 'components/ui/Inputs/DurationRange'
import { FilterByDocumentStatus, FilterKeys, Filters, genderOptions, vitalStatusesOptions } from 'types/searchCriterias'
import { Controller, useForm } from 'react-hook-form'
import ValueSets from 'components/ui/Inputs/ValueSets'
import CalendarRange from 'components/ui/Inputs/CalendarRange'
import ExecutiveUnits from 'components/ui/Inputs/ExecutiveUnits'
import { SourceType } from 'types/scope'
import TextInput from 'components/ui/Inputs/Text'
import MultiSelect from 'components/ui/Inputs/MultiSelect'
import allDocTypesList from 'assets/docTypes.json'
import DocTypes from 'components/ui/Inputs/DocTypes'
import { AdditionalInfo } from 'types/exploration'

type ExplorationFiltersProps = {
  filters: Filters
  infos: AdditionalInfo
  onSubmit: (filters: Filters) => void
  onError: (isError: boolean) => void
  onChange: (hasChange: boolean) => void
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

const ExplorationFilters = ({ filters, infos, onSubmit, onError, onChange }: ExplorationFiltersProps) => {
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isValid, isDirty },
    watch
  } = useForm<Filters>({
    defaultValues: filters,
    mode: 'onChange',
    reValidateMode: 'onChange'
  })

  useEffect(() => {
    reset(filters)
  }, [filters])

  useEffect(() => {
    const subscription = watch(() => handleSubmit(onSubmit)())
    return () => subscription.unsubscribe()
  }, [handleSubmit, onSubmit, watch])

  useEffect(() => {
    onError(!isValid)
  }, [isValid, onError])

  useEffect(() => {
    onChange(isDirty)
  }, [isDirty, onChange])

  // const fields: Record<string, React.FC<{ field: ControllerRenderProps }>> = useMemo(
  //   () => ({
  //     [FilterKeys.GENDERS]: ({ field }) => <CheckboxGroup {...field} label="Genre :" options={genderOptions} />,
  //     [FilterKeys.VITAL_STATUSES]: ({ field }) => (
  //       <CheckboxGroup {...field} label="Statut vital :" options={vitalStatusesOptions} />
  //     ),
  //     [FilterKeys.BIRTHDATES]: ({ field }) => <DurationRange {...field} label="Âge :" includeDays={!!deidentified} />,
  //     [FilterKeys.NDA]: ({ field }) => (
  //       <TextInput {...field} label="NDA :" placeholder="Exemple: 6601289264,141740347" />
  //     ),
  //     [FilterKeys.IPP]: ({ field }) => (
  //       <TextInput {...field} label="IPP :" placeholder="Exemple: 8000000000001,8000000000002" />
  //     ),
  //     [FilterKeys.CODE]: ({ field }) => <ValueSets {...field} label="Codes :" references={infos.references ?? []} />,
  //     [FilterKeys.DIAGNOSTIC_TYPES]: ({ field }) => (
  //       <MultiSelect {...field} options={infos.diagnosticTypesList ?? []} label="Type de diagnostics :" />
  //     ),
  //     [FilterKeys.SOURCE]: ({ field }) => <CheckboxGroup {...field} label="Source :" options={sourceOptions} />,
  //     [FilterKeys.DURATION_RANGE]: ({ field }) => <CalendarRange {...field} label="Date :" onError={() => {}} />,
  //     [FilterKeys.EXECUTIVE_UNITS]: ({ field }) => (
  //       <MultiSelect {...field} options={infos.encounterStatusList ?? []} label="Statut de la visite associée :" />
  //     )
  //   }),
  //   []
  // )
  // return (
  //   Object.keys(fields)
  //     .filter((k) => Object.keys(filters).includes(k))
  //     // To fix this type issue, too much work for little adding values. Types are only use internally and we know what is inside the fields.
  //     // eslint-disable-next-line @typescript-eslint/no-explicit-any
  //     .map((k) => <Controller name={k as any} control={control} render={fields[k] as any} />)
  // )
  return (
    <>
      {FilterKeys.VALIDATED_STATUS in filters && (
        <Controller
          name={FilterKeys.VALIDATED_STATUS}
          control={control}
          render={({ field }) => (
            <CheckboxGroup {...field} value={['validatedStatus']} options={biologyStatusOptions} disabled={true} />
          )}
        />
      )}
      {FilterKeys.ONLY_PDF_AVAILABLE in filters && (
        <Controller
          name={FilterKeys.ONLY_PDF_AVAILABLE}
          control={control}
          render={({ field }) => (
            <CheckboxGroup
              onChange={(newValue) => {
                const transformedValue = newValue.includes('onlyPdfAvailable')
                field.onChange(transformedValue)
              }}
              value={field.value ?? filters.onlyPdfAvailable ? ['onlyPdfAvailable'] : []}
              options={documentsStatusOptions}
            />
          )}
        />
      )}
      {FilterKeys.GENDERS in filters && (
        <Controller
          name={FilterKeys.GENDERS}
          control={control}
          render={({ field }) => <CheckboxGroup {...field} label="Genre :" options={genderOptions} />}
        />
      )}
      {FilterKeys.VITAL_STATUSES in filters && (
        <Controller
          name={FilterKeys.VITAL_STATUSES}
          control={control}
          render={({ field }) => <CheckboxGroup {...field} label="Statut vital :" options={vitalStatusesOptions} />}
        />
      )}
      {FilterKeys.BIRTHDATES in filters && (
        <Controller
          name={FilterKeys.BIRTHDATES}
          control={control}
          render={({ field }) => <DurationRange {...field} label="Âge :" includeDays={!infos.deidentified} />}
        />
      )}
      {FilterKeys.NDA in filters && (
        <Controller
          name={FilterKeys.NDA}
          control={control}
          render={({ field }) => <TextInput {...field} label="NDA :" placeholder="Exemple: 6601289264,141740347" />}
        />
      )}
      {FilterKeys.IPP in filters && (
        <Controller
          name={FilterKeys.IPP}
          control={control}
          render={({ field }) => (
            <TextInput {...field} label="IPP :" placeholder="Exemple: 8000000000001,8000000000002" />
          )}
        />
      )}
      {FilterKeys.DOC_STATUSES in filters && (
        <Controller
          name={FilterKeys.DOC_STATUSES}
          control={control}
          render={({ field }) => <MultiSelect {...field} options={docStatusesList} label="Statut de documents :" />}
        />
      )}
      {FilterKeys.DOC_TYPES in filters && (
        <Controller
          name={FilterKeys.DOC_TYPES}
          control={control}
          render={({ field }) => <DocTypes {...field} options={allDocTypesList.docTypes} label="Type de documents :" />}
        />
      )}
      {FilterKeys.PRESCRIPTION_TYPES in filters && (
        <Controller
          name={FilterKeys.PRESCRIPTION_TYPES}
          control={control}
          render={({ field }) =>
            field.value ? (
              <MultiSelect
                {...field}
                value={field.value}
                options={infos.prescriptionList ?? []}
                label="Type de prescriptions :"
              />
            ) : (
              <Fragment />
            )
          }
        />
      )}
      {FilterKeys.ADMINISTRATION_ROUTES in filters && (
        <Controller
          name={FilterKeys.ADMINISTRATION_ROUTES}
          control={control}
          render={({ field }) =>
            field.value ? (
              <MultiSelect
                {...field}
                value={field.value}
                options={infos.administrationList ?? []}
                label="Voie d'administration :"
              />
            ) : (
              <Fragment />
            )
          }
        />
      )}
      {FilterKeys.CODE in filters && (
        <Controller
          name={FilterKeys.CODE}
          control={control}
          render={({ field }) => <ValueSets {...field} label="Codes :" references={infos.references ?? []} />}
        />
      )}
      {FilterKeys.DIAGNOSTIC_TYPES in filters && (
        <Controller
          name={FilterKeys.DIAGNOSTIC_TYPES}
          control={control}
          render={({ field }) =>
            field.value ? (
              <MultiSelect
                {...field}
                value={field.value}
                options={infos.diagnosticTypesList ?? []}
                label="Type de diagnostics :"
              />
            ) : (
              <Fragment />
            )
          }
        />
      )}
      {FilterKeys.SOURCE in filters && (
        <Controller
          name={FilterKeys.SOURCE}
          control={control}
          render={({ field }) =>
            field.value ? (
              <CheckboxGroup {...field} value={field.value} label="Source :" options={sourceOptions} />
            ) : (
              <Fragment />
            )
          }
        />
      )}
      {FilterKeys.FORM_NAME in filters && (
        <Controller
          name={FilterKeys.FORM_NAME}
          control={control}
          render={({ field }) => (
            <CheckboxGroup {...field} label="Formulaire :" options={infos.questionnaires?.display ?? []} />
          )}
        />
      )}
      {FilterKeys.MODALITY in filters && (
        <Controller
          name={FilterKeys.MODALITY}
          control={control}
          render={({ field }) => <MultiSelect {...field} options={infos.modalities ?? []} label="Modalités :" />}
        />
      )}
      {FilterKeys.DURATION_RANGE in filters && (
        <Controller
          name={FilterKeys.DURATION_RANGE}
          control={control}
          render={({ field }) => <CalendarRange {...field} label="Date :" onError={() => {}} />}
        />
      )}
      {FilterKeys.EXECUTIVE_UNITS in filters && (
        <Controller
          name={FilterKeys.EXECUTIVE_UNITS}
          control={control}
          render={({ field }) => (
            <ExecutiveUnits {...field} label="Unité exécutrice :" sourceType={infos.sourceType ?? SourceType.ALL} />
          )}
        />
      )}
      {FilterKeys.ENCOUNTER_STATUS in filters && (
        <Controller
          name={FilterKeys.ENCOUNTER_STATUS}
          control={control}
          render={({ field }) => (
            <MultiSelect {...field} options={infos.encounterStatusList ?? []} label="Statut de la visite associée :" />
          )}
        />
      )}
    </>
  )
}

export default ExplorationFilters
