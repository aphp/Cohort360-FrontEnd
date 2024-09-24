import React from 'react'
import { CriteriaFormItemView, CriteriaFormItemType } from '../types'
import { renderLabel } from '../components'
import CalendarRange from 'components/ui/Inputs/CalendarRange'
import {
  Alert,
  Autocomplete,
  Checkbox,
  FormControlLabel,
  FormLabel,
  Grid,
  Radio,
  RadioGroup,
  Switch,
  TextField,
  Typography
} from '@mui/material'
import ExecutiveUnitsInput from 'components/ui/Inputs/ExecutiveUnit'
import OccurenceInput from 'components/ui/Inputs/Occurences'
import SearchbarWithCheck from 'components/ui/Inputs/SearchbarWithCheck'
import AsyncAutocomplete from 'components/ui/Inputs/AsyncAutocomplete'
import CheckedTextfield from 'components/ui/Inputs/CheckedTextfield'
import { isArray } from 'lodash'
import useStyles from '../style'
import { useAppSelector } from 'state'
import { BlockWrapper } from 'components/ui/Layout'
import { fetchValueSet } from 'services/aphp/callApi'
import DurationRange from 'components/ui/Inputs/DurationRange'
import { IndeterminateCheckBoxOutlined } from '@mui/icons-material'
import _ from 'lodash'

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
        active={!props.disabled}
        onChange={(range) =>
          !range[0] && !range[1]
            ? props.updateData(null)
            : props.updateData({ start: range[0] ?? null, end: range[1] ?? null, includeNull: false })
        }
        onError={(isError) => props.setError(isError ? 'error' : undefined)}
        deidentified={props.deidentified}
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
  autocomplete: (props) => {
    const codeSystem = props.getValueSetOptions(props.definition.valueSetId)
    const groupBy = props.definition.groupBy
    const valueWithLabels = (props.value ?? []).map((code) => codeSystem.find((c) => c.id === code.id) ?? code)
    const value = props.definition.singleChoice ? valueWithLabels?.at(0) ?? null : valueWithLabels ?? []
    return (
      <Autocomplete
        multiple={!props.definition.singleChoice}
        disabled={props.disabled}
        disableClearable={props.definition.singleChoice}
        options={codeSystem}
        noOptionsText={props.definition.noOptionsText}
        getOptionLabel={(option) => option.label}
        isOptionEqualToValue={(option, value) => option.id === value.id}
        value={value}
        onChange={(e, value) => props.updateData(value ? (isArray(value) ? value : [value]) : null)}
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
                    props.updateData(valueWithLabels.filter((doc) => doc[groupBy] !== group))
                  } else {
                    props.updateData(_.uniqWith([...valueWithLabels, ...groupChildren], _.isEqual))
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
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const { classes } = useStyles()
    return (
      <RadioGroup
        row
        style={{ justifyContent: 'space-around' }}
        className={classes.inputItem}
        aria-label="mode"
        name="criteria-mode-radio"
        value={props.value}
        onChange={(e, value) => props.updateData(value)}
      >
        {props.definition.choices.map((choice, index) => (
          <FormControlLabel key={index} value={choice.id} control={<Radio color="secondary" />} label={choice.label} />
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
      />
    )
  },
  numberAndComparator: (props) => {
    const nonNullValue = props.value ?? { value: 0, comparator: 'GREATER_OR_EQUAL' }
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
        disabled={props.disabled}
      />
    )
  },
  boolean: (props) => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const { classes } = useStyles()
    return (
      <BlockWrapper className={classes.inputItem} container alignItems="center">
        <FormLabel component="legend">{props.definition.label}</FormLabel>
        <Switch checked={props.value} onChange={(event) => props.updateData(event.target.checked)} color="secondary" />
      </BlockWrapper>
    )
  },
  textWithCheck: (props) => (
    <SearchbarWithCheck
      searchInput={props.value}
      setSearchInput={(value) => props.updateData(value)}
      placeholder={props.definition.placeholder}
      onError={(isError) => props.setError(isError ? props.definition.errorType : undefined)}
    />
  ),
  codeSearch: (props) => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const codeCaches = useAppSelector((state) => state.valueSets.cache)
    const valueWithLabels = (props.value ?? []).map(
      (code) =>
        (code.system && codeCaches[code.system]?.find((c) => c.id === code.id)) ||
        Object.keys(codeCaches)
          .flatMap((key) => codeCaches[key])
          .find((c) => c.id === code.id) ||
        code
    )
    return (
      <AsyncAutocomplete
        label={props.definition.label || 'Code(s) sélectionné(s)'}
        variant="outlined"
        noOptionsText={props.definition.noOptionsText}
        values={valueWithLabels}
        onFetch={(search, signal) => props.searchCode(search, props.definition.valueSetIds.join(','), signal)}
        onChange={(value) => {
          // TODO this is a temporary fix that should be properly addressed with the new code search component
          if (props.definition.checkIsLeaf) {
            ;(async () => {
              const valuesWithLeafInfo = await Promise.all(
                value.map(async (v) => {
                  const res = await fetchValueSet(v.system ?? props.definition.valueSetIds.join(','), {
                    valueSetTitle: 'Toute la hiérarchie',
                    code: v.id,
                    noStar: true
                  })
                  return { ...v, isLeaf: res?.length === 0 }
                })
              )
              props.updateData(valuesWithLeafInfo)
            })()
          } else {
            props.updateData(value)
          }
        }}
      />
    )
  }
}

export default FORM_ITEM_RENDERER
