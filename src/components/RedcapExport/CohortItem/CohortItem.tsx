import React, { ChangeEvent } from 'react'

import { IconButton, Select, MenuItem, Button, TextField, Tooltip, TableCell, TableRow } from '@material-ui/core'
import {
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  Delete as DeleteIcon,
  Info as InfoIcon
} from '@material-ui/icons'

import { CRF_ATTRIBUTES } from 'data/crfParameters'
import useStyles from './styles'
import { ExportItem, AnonymizationType } from '../RedcapExport'

type CohortItemProps = {
  item: ExportItem
  anonymization: AnonymizationType
  onDelete: (item: ExportItem) => void
  onChange: (item: ExportItem) => void
}

const CohortItem = ({ item, anonymization, onDelete, onChange }: CohortItemProps): JSX.Element => {
  const classes = useStyles()

  const names = CRF_ATTRIBUTES.map((x) => x.officialName)
  const isAnonymizeItemDisabled =
    item.attr_type === 'insensitive' ||
    (anonymization === 2 ? ['First name', 'Last name', 'Identifier'].includes(item.officialName) : false)

  const getTextLabel = () => {
    let textLabel = `"${item.officialName}" est un attribut de type ${item.attr_type}, `
    switch (item.attr_type) {
      case 'identifying':
        textLabel += "l'information sera supprimée du dataset anonymisé."
        break
      case 'quasiidentifying':
        textLabel += `l'information sera aggrégée selon une hiérachie de type "${item.hierarchy_type}".`
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

  const renderSelectOptions = () => {
    return names.map((dt, i) => (
      <MenuItem key={i} value={dt}>
        {dt}
      </MenuItem>
    ))
  }

  const handleChangeSelect = (
    event: React.ChangeEvent<{
      name?: string | undefined
      value: unknown
    }>
  ) => {
    const _officialName = event.target.value as string
    const crfAttribute = CRF_ATTRIBUTES.find(({ officialName }) => officialName === _officialName)

    crfAttribute && onChange({ ...crfAttribute, id: item.id })
  }
  const handleChangeAnonymize = () => {
    onChange({ ...item, anonymize: !item.anonymize })
  }
  const handleChangeCustomName = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const customName = event.target.value
    onChange({ ...item, customName })
  }
  const handleDelete = () => {
    onDelete(item)
  }

  return (
    <TableRow key="name">
      <TableCell padding="none">
        <div className={classes.flex}>
          <Tooltip title={`La variable ${item.anonymize ? 'est' : "n'est pas"} anonymisée`}>
            <IconButton onClick={handleChangeAnonymize} disabled={isAnonymizeItemDisabled}>
              {item.anonymize ? <VisibilityOffIcon /> : <VisibilityIcon />}
            </IconButton>
          </Tooltip>
          <Select
            onChange={handleChangeSelect}
            className={classes.attributeSelect}
            disableUnderline
            fullWidth
            value={item.officialName ? item.officialName : CRF_ATTRIBUTES[0].officialName}
          >
            {renderSelectOptions()}
          </Select>
        </div>
      </TableCell>
      <TableCell padding="none">
        <TextField
          value={item.customName}
          className={classes.attributeText}
          InputProps={{
            disableUnderline: true
          }}
          onChange={handleChangeCustomName}
        />
      </TableCell>
      <TableCell align="right" padding="none">
        <Button variant="contained" onClick={handleDelete} className={classes.crfButton}>
          <DeleteIcon />
        </Button>
        <Tooltip title={getTextLabel()} aria-label="add">
          <Button type="button" className={classes.crfButton}>
            <InfoIcon />
          </Button>
        </Tooltip>
      </TableCell>
    </TableRow>
  )
}

export default CohortItem
