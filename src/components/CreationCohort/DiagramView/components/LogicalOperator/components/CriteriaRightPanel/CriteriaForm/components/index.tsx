import { FormLabel, Tooltip, Typography } from '@mui/material'
import React, { PropsWithChildren, useEffect, useState } from 'react'
import {
  Context,
  CriteriaFormItemView,
  CriteriaFormItemViewProps,
  CriteriaItem,
  CriteriaFormItemType,
  CriteriaSection,
  DataTypeMapping,
  DataTypeMappings,
  DataTypes
} from '../types'
import { BlockWrapper } from 'components/ui/Layout'
import Collapse from 'components/ui/Collapse'
import { CriteriaLabel } from 'components/ui/CriteriaLabel'
import InfoIcon from '@mui/icons-material/Info'
import { isFunction, isString } from 'lodash'
import { SelectedCriteriaType } from 'types/requestCriterias'
import useStyles from '../style'

type CriteriaItemRuntimeProps<T> = {
  setError: (error?: string) => void
  updateData: (data: T) => void
  data: T
  getValueSetOptions: CriteriaFormItemViewProps<never>['getValueSetOptions']
  searchCode: CriteriaFormItemViewProps<never>['searchCode']
  viewRenderers: { [key in CriteriaFormItemType]: CriteriaFormItemView<key> }
  deidentified: boolean
}

type CritieraItemProps<T, U extends DataTypeMappings> = CriteriaItemRuntimeProps<T> & CriteriaItem<T, U>

export const renderLabel = (label: string, tooltip?: string, altStyle?: boolean) => {
  if (altStyle) {
    return (
      <FormLabel
        style={{ padding: '0 0 1em', fontWeight: 600, fontSize: 12, display: 'flex', alignItems: 'center' }}
        component="legend"
      >
        {label}
        {tooltip && (
          <Tooltip title={tooltip}>
            <InfoIcon fontSize="small" color="primary" style={{ marginLeft: 4 }} />
          </Tooltip>
        )}
      </FormLabel>
    )
  }
  return label
}

export const CFItem = <T, V extends DataTypeMappings, U extends CriteriaItem<T, V>>(props: CritieraItemProps<T, V>) => {
  const { valueKey, updateData, data, setError, getValueSetOptions, searchCode, viewRenderers } = props
  const View = viewRenderers[props.type] as CriteriaFormItemView<U['type']>
  const fieldValue = (valueKey ? data[valueKey] : undefined) as DataTypeMapping[U['type']]['dataType']
  const context = { deidentified: props.deidentified }
  const displayCondition = props.displayCondition
  console.log('rerendering', props.label, data)
  if (
    displayCondition &&
    ((isFunction(displayCondition) && !displayCondition(data as Record<string, DataTypes>, context)) ||
      (isString(displayCondition) && !eval(displayCondition)(data, context)))
  ) {
    return null
  }
  const disableCondition = props.disableCondition
  const disabled =
    disableCondition &&
    ((isFunction(disableCondition) && disableCondition(data as Record<string, DataTypes>, context)) ||
      (isString(disableCondition) && eval(disableCondition)(data, context)))
  return (
    <CFItemWrapper
      label={props.extraLabel}
      info={props.extraInfo}
      displayValueSummary={props.displayValueSummary}
      data={data}
      value={fieldValue}
      context={context}
    >
      <View
        value={fieldValue}
        disabled={disabled}
        definition={props}
        updateData={(value) => valueKey && updateData({ ...data, [valueKey]: value })}
        getValueSetOptions={getValueSetOptions}
        searchCode={searchCode}
        setError={setError}
        deidentified={props.deidentified}
      />
    </CFItemWrapper>
  )
}

export function CFSection<T extends SelectedCriteriaType>(
  props: PropsWithChildren<Omit<CriteriaSection<T>, 'items'> & { collapsed?: boolean }>
) {
  const { classes } = useStyles()
  return props.title ? (
    <BlockWrapper className={classes.inputItem}>
      <Collapse title={props.title} info={props.info} value={!props.defaulCollapsed || !props.collapsed}>
        {props.children}
      </Collapse>
    </BlockWrapper>
  ) : (
    <>{props.children}</>
  )
}

export function CFItemWrapper<T>(
  props: PropsWithChildren<{
    label?: string | ((data: Record<string, DataTypes>, context: Context) => string)
    info?: string
    data: T
    value: DataTypes
    displayValueSummary?: string | ((value: DataTypes) => string)
    context: Context
  }>
) {
  const { classes } = useStyles()
  const { label, data, context, displayValueSummary, value } = props
  const [valueSummary, setValueSummary] = useState<string | undefined>(undefined)

  useEffect(() => {
    if (isFunction(displayValueSummary)) {
      setValueSummary(displayValueSummary(value))
    } else if (isString(displayValueSummary)) {
      setValueSummary(eval(displayValueSummary)(value))
    }
    // only value can change
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value])
  const labelValue =
    label &&
    ((isFunction(label) && label(data as Record<string, DataTypes>, context)) ||
      (isString(label) && eval(label)(data, context)))
  return (
    <BlockWrapper className={classes.inputItem}>
      {labelValue ? <CriteriaLabel label={labelValue} style={{ marginTop: '1em' }} infoIcon={props.info} /> : ''}
      {valueSummary && <Typography style={{ fontWeight: 'bold', marginBottom: '1em' }}>{valueSummary}</Typography>}
      {props.children}
    </BlockWrapper>
  )
}

export default { CFItemWrapper, CFSection, renderLabel, CFItem }
