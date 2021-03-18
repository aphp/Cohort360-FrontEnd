import React, { ChangeEvent } from 'react'
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

import useStyles from './styles'
import { ExportItem } from '../RedcapExport'
import { IconButton } from '@material-ui/core'
import { Visibility, VisibilityOff } from '@material-ui/icons'

type CohortItemProps = {
  item: ExportItem
  onDelete: (item: ExportItem) => void
  onChange: (item: ExportItem) => void
}

const CohortItem = ({ item, onDelete, onChange }: CohortItemProps): JSX.Element => {
  const classes = useStyles()

  const names = CRF_ATTRIBUTES.map((x) => x.officialName)

  const getTextLabel = () => {
    let textLabel = `"${item.officialName}" est un attribut de type ${item.att_type}, `
    switch (item.att_type) {
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
            <IconButton onClick={handleChangeAnonymize} disabled={item.att_type === 'insensitive'}>
              {item.anonymize ? <VisibilityOff /> : <Visibility />}
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
