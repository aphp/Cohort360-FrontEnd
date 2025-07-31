import { FormLabel, Grid, IconButton } from '@mui/material'
import React, { useState } from 'react'
import { Hierarchy } from 'types/hierarchy'
import { FhirItem, Reference } from 'types/valueSet'
import SearchValueSet from '.'
import Panel from 'components/ui/Panel'
import { SearchOutlined } from '@mui/icons-material'
import CloseIcon from '@mui/icons-material/Close'
import MoreHorizIcon from '@mui/icons-material/MoreHoriz'
import CodesWithSystems from 'components/Hierarchy/CodesWithSystems'
import { isEqual, sortBy } from 'lodash'

type ValueSetFieldProps = {
  value: Hierarchy<FhirItem>[]
  references: Reference[]
  placeholder: string
  disabled?: boolean
  onSelect: (selectedItems: Hierarchy<FhirItem>[]) => void
}

const PANEL_WIDTH = '900px'

const ValueSetField = ({ value, references, placeholder, disabled = false, onSelect }: ValueSetFieldProps) => {
  const [openCodeResearch, setOpenCodeResearch] = useState(false)
  const [isExtended, setIsExtended] = useState(false)
  const [confirmedValueSets, setConfirmedValueSets] = useState<Hierarchy<FhirItem>[]>(value)

  const handleDelete = (node: Hierarchy<FhirItem>) => {
    const newCodes = value.filter((item) => !(item.id === node.id && item.system === node.system))
    onSelect(newCodes)
  }

  const handleOpen = () => {
    setOpenCodeResearch(true)
    setIsExtended(false)
  }

  return (
    <>
      <Grid
        container
        sx={{ alignItems: value.length ? 'flex-start' : 'center' }}
        border="1px solid rgba(0, 0, 0, 0.25)"
        borderRadius="4px"
        padding="9px 3px 9px 12px"
        className="ValueSetField"
      >
        <Grid
          container
          size={10}
          sx={{ alignItems: 'center' }}
          role="button"
          tabIndex={0}
          style={{ cursor: 'pointer' }}
          onClick={handleOpen}
        >
          <CodesWithSystems disabled={disabled} codes={value} isExtended={isExtended} onDelete={handleDelete} />
          {!value.length && <FormLabel component="legend">{placeholder}</FormLabel>}
        </Grid>
        <Grid size={2} container sx={{ justifyContent: 'flex-end' }}>
          {isExtended && value.length > 0 && (
            <IconButton size="small" sx={{ color: '#5BC5F2' }} onClick={() => setIsExtended(false)}>
              <CloseIcon />
            </IconButton>
          )}
          {!isExtended && value.length > 0 && (
            <IconButton size="small" sx={{ color: '#5BC5F2' }} onClick={() => setIsExtended(true)}>
              <MoreHorizIcon />
            </IconButton>
          )}
          <IconButton sx={{ color: '#5BC5F2' }} size="small" onClick={handleOpen} disabled={disabled}>
            <SearchOutlined />
          </IconButton>
        </Grid>
      </Grid>
      <Panel
        size={PANEL_WIDTH}
        mandatory={isEqual(sortBy(confirmedValueSets), sortBy(value))}
        onConfirm={() => {
          onSelect(confirmedValueSets)
          setOpenCodeResearch(false)
        }}
        onClose={() => setOpenCodeResearch(false)}
        open={openCodeResearch}
      >
        <SearchValueSet references={references} onSelect={setConfirmedValueSets} selectedNodes={value} />
      </Panel>
    </>
  )
}

export default ValueSetField
