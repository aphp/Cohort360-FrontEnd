import React, { useEffect, useState } from 'react'
import { CriteriaFormItemView, CriteriaFormItemType } from '../types'
import { renderLabel } from '../components'
import CalendarRange from 'components/ui/Inputs/CalendarRange'
import {
  Alert,
  Autocomplete,
  Checkbox,
  FormControlLabel,
  Grid,
  Radio,
  RadioGroup,
  Switch,
  TextField,
  Typography
} from '@mui/material'
import ExecutiveUnitsInput from 'components/ui/Inputs/ExecutiveUnits'
import OccurenceInput from 'components/ui/Inputs/Occurences'
import CheckedTextfield from 'components/ui/Inputs/CheckedTextfield'
import _, { isArray } from 'lodash'
import useStyles from '../style'
import { useAppSelector } from 'state'
import { BlockWrapper } from 'components/ui/Layout'
import DurationRange from 'components/ui/Inputs/DurationRange'
import { IndeterminateCheckBoxOutlined } from '@mui/icons-material'
import { CriteriaLabel } from 'components/ui/CriteriaLabel'
import { Comparators } from 'types/requestCriterias'
import SimpleSelect from 'components/ui/Inputs/SimpleSelect'
import ValueSetField from 'components/SearchValueSet/ValueSetField'
import { checkIsLeaf } from 'utils/valueSets'
import { selectValueSetCodes } from 'state/valueSets'
import SearchbarWithCheck from 'components/ui/Searchbar/SearchbarWithChecks'
import { SearchbarWithCheckWrapper } from 'components/ui/Searchbar/styles'

/************************************************************************************/
/*                        Criteria Form Item Renderer                               */
/************************************************************************************/
/*
This file contains the list of functions used to render the React view form for each CriteriaFormItemType.
*/

const FORM_ITEM_RENDERER: { [key in CriteriaFormItemType]: CriteriaFormItemView<key> } = {
  info: (props) => {
    return <Alert severity={props.definition.contentType}>{props.definition.content}</Alert>
  },
  text: (props) => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const { classes } = useStyles()
    return (
      <TextField
        required
        className={classes.inputItem}
        placeholder={props.definition.label}
        variant="outlined"
        value={props.value}
        onChange={(e) => props.updateData(e.target.value)}
      />
    )
  },
  textWithRegex: (props) => {
    return (
      <CheckedTextfield
        value={props.value}
        multiline={props.definition.multiline}
        inverseCheck={props.definition.inverseCheck}
        extractValidValues={props.definition.extractValidValues}
        displayCheckError={props.definition.displayCheckError}
        regex={props.definition.regex}
        errorMessage={props.definition.checkErrorMessage}
        placeholder={props.definition.placeholder}
        onError={(isError) => props.setError(isError ? 'error' : undefined)}
        onChange={(value) => props.updateData(value)}
      />
    )
  },
  durationRange: (props) => {
    return (
      <DurationRange
        value={props.value ? [props.value.start, props.value.end] : [null, null]}
        disabled={props.disabled}
        onChange={(range) =>
          !range[0] && !range[1]
            ? props.updateData(null)
            : props.updateData({ start: range[0] ?? null, end: range[1] ?? null, includeNull: false })
        }
        unit={props.definition.unit}
        onError={(isError) => props.setError(isError ? 'error' : undefined)}
        includeDays={!props.deidentified || !!props.definition.includeDays}
      />
    )
  },
  calendarRange: (props) => (
    <CalendarRange
      inline
      disabled={props.disabled}
      label={
        props.definition.label &&
        renderLabel(props.definition.label, props.definition.info, props.definition.labelAltStyle)
      }
      value={props.value ? [props.value.start, props.value.end] : [null, null]}
      onChange={(range, includeNull) =>
        !range[0] && !range[1]
          ? props.updateData(null)
          : props.updateData({ start: range[0] ?? null, end: range[1] ?? null, includeNull })
      }
      onError={(isError) => props.setError(isError ? props.definition.errorType : undefined)}
      includeNullValues={props.value?.includeNull}
      onChangeIncludeNullValues={
        props.definition.withOptionIncludeNull
          ? () => {
              /* dummy TODO change CalendarRange to accept a boolean to activate the includeNull checkbox */
            }
          : undefined
      }
    />
  ),
  select: (props) => {
    return (
      <SimpleSelect
        value={props.value}
        label={props.definition.label}
        options={props.definition.choices}
        onChange={(val) => props.updateData(val)}
      />
    )
  },
  autocomplete: (props) => {
    const arrayPropValue = isArray(props.value) ? props.value : !!props.value ? [props.value] : []
    const codeSystem = props.getValueSetOptions(props.definition.valueSetId)
    const groupBy = props.definition.groupBy
    const valueWithLabels = (arrayPropValue ?? []).map(
      (code) => codeSystem.find((c) => c.id === code) ?? { id: code, label: code }
    )
    const value = props.definition.singleChoice ? valueWithLabels?.at(0) ?? null : valueWithLabels ?? []
    return (
      <Autocomplete
        multiple={!props.definition.singleChoice}
        disabled={props.disabled}
        disableClearable={props.definition.singleChoice}
        options={codeSystem}
        noOptionsText={props.definition.noOptionsText}
        getOptionLabel={(option) => `${props.definition.prependCode ? option.id + ' - ' : ''}${option.label}`}
        isOptionEqualToValue={(option, value) => option.id === value.id}
        value={value}
        onChange={(e, value) => props.updateData(value ? (isArray(value) ? value.map((v) => v.id) : [value.id]) : null)}
        renderInput={(params) => <TextField {...params} label={props.definition.label} />}
        groupBy={groupBy ? (option) => option[groupBy] ?? '' : undefined}
        renderGroup={
          groupBy
            ? (params) => {
                const { group, children } = params
                const groupChildren = codeSystem.filter((doc) => doc[groupBy] === group)
                const selectedWithinGroup = valueWithLabels.filter((doc) => doc[groupBy] === group)

                const onClick = () => {
                  if (groupChildren.length === selectedWithinGroup.length) {
                    props.updateData(valueWithLabels.filter((doc) => doc[groupBy] !== group).map((doc) => doc.id))
                  } else {
                    props.updateData(_.uniqWith([...valueWithLabels, ...groupChildren], _.isEqual).map((doc) => doc.id))
                  }
                }

                return (
                  <React.Fragment>
                    <Grid container direction="row" alignItems="center">
                      <Checkbox
                        indeterminate={
                          groupChildren.length !== selectedWithinGroup.length && selectedWithinGroup.length > 0
                        }
                        checked={groupChildren.length === selectedWithinGroup.length}
                        onClick={onClick}
                        indeterminateIcon={<IndeterminateCheckBoxOutlined />}
                      />
                      <Typography onClick={onClick} noWrap style={{ cursor: 'pointer', width: 'calc(100% - 150px' }}>
                        {group}
                      </Typography>
                    </Grid>
                    {children}
                  </React.Fragment>
                )
              }
            : undefined
        }
      />
    )
  },
  radioChoice: (props) => {
    return (
      <RadioGroup
        row
        style={{ justifyContent: 'space-around' }}
        aria-label="mode"
        name="criteria-mode-radio"
        value={props.value}
        onChange={(e, value) => props.updateData(value)}
      >
        {props.definition.choices.map((choice) => (
          <FormControlLabel
            key={choice.id}
            value={choice.id}
            control={<Radio color="secondary" />}
            label={choice.label}
          />
        ))}
      </RadioGroup>
    )
  },
  executiveUnit: (props) => (
    <ExecutiveUnitsInput
      sourceType={props.definition.sourceType}
      value={props.value || []}
      onChange={(value) => props.updateData(value)}
    />
  ),
  number: (props) => {
    // TODO add regex number check ? and set type text
    return (
      <TextField
        type="number"
        variant="outlined"
        value={props.value}
        onChange={(e) => props.updateData(e.target.value ? parseFloat(e.target.value) : null)}
        placeholder={props.definition.label}
        disabled={props.disabled}
        fullWidth
        InputProps={{
          inputProps: {
            min: props.definition.min
          }
        }}
      />
    )
  },
  numberAndComparator: (props) => {
    const nonNullValue = props.value ?? { value: 0, comparator: Comparators.GREATER_OR_EQUAL }
    return (
      <OccurenceInput
        floatValues={props.definition.floatValues}
        allowBetween={props.definition.allowBetween}
        label={props.definition.label}
        value={nonNullValue.value}
        comparator={nonNullValue.comparator}
        maxValue={nonNullValue.maxValue}
        onchange={(newCount, newComparator, maxValue) => {
          props.updateData({ value: newCount, comparator: newComparator, maxValue: maxValue })
        }}
        withHierarchyInfo={props.definition.withHierarchyInfo}
        withInfo={props.definition.info}
        disabled={props.disabled}
      />
    )
  },
  boolean: (props) => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    return (
      <BlockWrapper container alignItems="center">
        <CriteriaLabel
          label={props.definition.label ?? ''}
          infoIcon={props.definition.extraInfo}
          style={{ padding: 0 }}
        >
          <Switch
            checked={props.value}
            onChange={(event) => props.updateData(event.target.checked)}
            disabled={props.disabled}
          />
        </CriteriaLabel>
      </BlockWrapper>
    )
  },
  textWithCheck: (props) => (
    <SearchbarWithCheckWrapper>
      <SearchbarWithCheck
        value={props.value}
        onChange={(value) => props.updateData(value)}
        placeholder={props.definition.placeholder}
        onError={(isError) => props.setError(isError ? props.definition.errorType : undefined)}
      />
    </SearchbarWithCheckWrapper>
  ),
  codeSearch: (props) => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const codeCaches = useAppSelector((state) => state.valueSets.cache)
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const cachedCodes = useAppSelector((state) =>
      selectValueSetCodes(
        state,
        props.definition.valueSetsInfo.map((ref) => ref.url)
      )
    )
    const valueWithLabels = (props.value ?? []).map(
      (code) =>
        (code.system && codeCaches[code.system]?.find((c) => c.id === code.id)) ||
        Object.keys(codeCaches)
          .flatMap((key) => codeCaches[key])
          .find((c) => c.id === code.id) ||
        code
    )
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const [valueBuffer, setValueBuffer] = useState(valueWithLabels)

    // eslint-disable-next-line react-hooks/rules-of-hooks
    useEffect(() => {
      if (props.definition.checkIsLeaf) {
        ;(async () => {
          const codesWithLeafInfo = await Promise.all(
            valueBuffer.map(async (v) => {
              const isLeaf = await checkIsLeaf([v], cachedCodes)
              return {
                ...v,
                isLeaf
              }
            })
          )
          props.updateData(codesWithLeafInfo)
        })()
      } else {
        props.updateData(valueBuffer)
      }
    }, [valueBuffer])

    return (
      <ValueSetField
        value={valueWithLabels}
        references={props.definition.valueSetsInfo}
        onSelect={(value) => {
          setValueBuffer(value)
        }}
        placeholder={props.definition.label ?? 'Code(s) sélectionné(s)'}
      />
    )
  }
}

export default FORM_ITEM_RENDERER
