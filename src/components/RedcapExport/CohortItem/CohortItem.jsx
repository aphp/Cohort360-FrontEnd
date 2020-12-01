import React, { useState } from 'react'
import { CRF_ATTRIBUTES } from '../../../data/crfParameters'

import Select from '@material-ui/core/Select'
import MenuItem from '@material-ui/core/MenuItem'
import Button from '@material-ui/core/Button'
import TextField from '@material-ui/core/TextField'
import Tooltip from '@material-ui/core/Tooltip'
import Switch from '@material-ui/core/Switch'

import TableCell from '@material-ui/core/TableCell'
import TableRow from '@material-ui/core/TableRow'

import DeleteIcon from '@material-ui/icons/Delete'
import InfoIcon from '@material-ui/icons/Info'

import PropTypes from 'prop-types'
import useStyles from './styles'

const CohortItem = (props) => {
  const classes = useStyles()

  const names = CRF_ATTRIBUTES.map((x) => x.officialName)
  const [customName, setCustomName] = useState(props.crfAttribute.officialName)
  const [textSearch, setTextSearch] = useState(props.crfAttribute.officialName)

  const [anonymise, setAnonymise] = useState(props.crfAttribute.anonymize)

  const getTextLabel = () => {
    let textLabel = `"${props.crfAttribute.officialName}" est un attribut de type ${props.crfAttribute.att_type}, `
    switch (props.crfAttribute.att_type) {
      case 'identifying':
        textLabel += "l'information sera supprimée du dataset anonymisé."
        break
      case 'quasiidentifying':
        textLabel += `l'information sera aggrégée selon une hiérachie de type "${props.crfAttribute.hierarchy_type}".`
        break
      case 'sensitive':
        textLabel += "l'information sera protégée par le critère de L-diversity."
        break
      case 'insensitive':
        textLabel += "l'information ne sera pas modifiée."
        break
      default:
        break
    }
    return textLabel
  }

  const [label, setLabel] = useState(getTextLabel())

  const onFormChange = (name) => {
    props.crfAttribute.customName = name
    setCustomName(name)
  }
  const onTextChange = (name) => {
    props.crfAttribute.text = name
    setTextSearch(name)
    setCustomName(`${props.crfAttribute.officialName}_${name}`)
    props.crfAttribute.customName = customName
  }

  const onLabelChange = (event, i) => {
    const attributeKey = i.key
    const tmpAttribute = { ...CRF_ATTRIBUTES[attributeKey] }

    props.crfAttribute.officialName = tmpAttribute.officialName
    props.crfAttribute.customName = tmpAttribute.customName
    props.crfAttribute.att_type = tmpAttribute.att_type
    props.crfAttribute.hierarchy_type = tmpAttribute.hierarchy_type
    props.crfAttribute.type = tmpAttribute.type
    props.crfAttribute.text = ''

    tmpAttribute.customName = tmpAttribute.officialName
    setCustomName(event.target.value)
    setAnonymise(tmpAttribute.anonymize)
    setTextSearch('')
    setLabel(getTextLabel())
  }

  const renderSelectOptions = () => {
    return names.map((dt, i) => (
      <MenuItem key={i} value={dt} name={i}>
        {dt}
      </MenuItem>
    ))
  }
  const handleSwitchChange = (event) => {
    props.crfAttribute.anonymize = event.target.checked
    setAnonymise(event.target.checked)
  }

  return (
    <TableRow key="name">
      <TableCell className={classes.tableCell}>
        <Switch
          checked={anonymise}
          onChange={handleSwitchChange}
          color="primary"
          inputProps={{ 'aria-label': 'primary checkbox' }}
          disabled={props.crfAttribute.att_type === 'insensitive'}
        />
      </TableCell>
      <TableCell className={classes.tableCell}>
        <Select
          onChange={(evt, i) => onLabelChange(evt, i)}
          className={classes.attributeSelect}
          disableUnderline
          value={props.crfAttribute.officialName ? props.crfAttribute.officialName : CRF_ATTRIBUTES[0].officialName}
        >
          {renderSelectOptions()}
        </Select>
      </TableCell>
      <TableCell className={classes.tableCell}>
        <TextField
          value={customName}
          className={classes.attributeText}
          InputProps={{
            disableUnderline: true
          }}
          onChange={(evt) => {
            onFormChange(evt.target.value)
          }}
        />
      </TableCell>
      <TableCell className={classes.tableCell}>
        <TextField
          value={textSearch}
          className={classes.attributeText}
          InputProps={{
            disableUnderline: true
          }}
          onChange={(evt) => {
            onTextChange(evt.target.value)
          }}
          disabled={props.crfAttribute.type !== 'text'}
        />
      </TableCell>
      <TableCell className={classes.tableCell} align="right">
        <Button
          variant="contained"
          onClick={() => {
            props.onRemove(props.crfAttribute)
          }}
          className={classes.crfButton}
        >
          <DeleteIcon />
        </Button>
        <Tooltip title={label} aria-label="add">
          <Button type="button" className={classes.crfButton}>
            <InfoIcon />
          </Button>
        </Tooltip>
      </TableCell>
    </TableRow>
  )
}

CohortItem.propTypes = {
  crfAttribute: PropTypes.shape({
    officialName: PropTypes.string.isRequired,
    customName: PropTypes.string.isRequired,
    att_type: PropTypes.string,
    hierarchy_type: PropTypes.string,
    type: PropTypes.string,
    text: PropTypes.string,
    anonymize: PropTypes.bool.isRequired
  }).isRequired,
  onRemove: PropTypes.func.isRequired
}
export default CohortItem
