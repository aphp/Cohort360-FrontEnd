import { Chip, FormLabel, Grid, IconButton } from '@mui/material'
import React, { useState } from 'react'
import { FhirItem, Hierarchy } from 'types/hierarchy'
import { Reference } from 'types/searchValueSet'
import SearchValueSet from '.'
import Panel from 'components/ui/Panel'
import { SearchOutlined } from '@mui/icons-material'
import CloseIcon from '@mui/icons-material/Close'
import MoreHorizIcon from '@mui/icons-material/MoreHoriz'

type ValueSetFieldProps = {
  value: Hierarchy<FhirItem>[]
  references: Reference[]
  placeholder: string
  onSelect: (selectedItems: Hierarchy<FhirItem>[]) => void
}

const ValueSetField = ({ value, references, placeholder, onSelect }: ValueSetFieldProps) => {
  const [openCodeResearch, setOpenCodeResearch] = useState(false)
  const [isExtended, setIsExtended] = useState(false)
  const MAX_CHIP_NUMBER = 2

  return (
    <>
      <Grid
        container
        alignItems="center"
        border="1px solid rgba(0, 0, 0, 0.25)"
        borderRadius="4px"
        padding="9px 3px 9px 12px"
      >
        <Grid container item xs={10}>
          <Grid item xs={11}>
            {value.length < 1 && <FormLabel component="legend">{placeholder}</FormLabel>}
            {value.length > 0 && (
              <Grid container alignItems="center">
                {value.slice(0, isExtended ? value.length : MAX_CHIP_NUMBER).map((code) => (
                  <Chip label={code.label} sx={{ marginBottom: '2px', marginRight: '2px' }} />
                ))}
              </Grid>
            )}
          </Grid>
        </Grid>
        <Grid item xs={2} container justifyContent="flex-end">
          {isExtended && value.length > MAX_CHIP_NUMBER && (
            <IconButton size="small" sx={{ color: '#5BC5F2' }} onClick={() => setIsExtended(false)}>
              <CloseIcon />
            </IconButton>
          )}
          {!isExtended && value.length > MAX_CHIP_NUMBER && (
            <IconButton size="small" sx={{ color: '#5BC5F2' }} onClick={() => setIsExtended(true)}>
              <MoreHorizIcon />
            </IconButton>
          )}
          <IconButton sx={{ color: '#5BC5F2' }} size="small" onClick={() => setOpenCodeResearch(true)}>
            <SearchOutlined />
          </IconButton>
        </Grid>
      </Grid>
      <Panel
        onClose={() => setOpenCodeResearch(false)}
        onConfirm={() => setOpenCodeResearch(false)}
        open={openCodeResearch}
      >
        <SearchValueSet references={references} onSelect={onSelect} selectedNodes={value} />
      </Panel>
    </>
  )
}

export default ValueSetField
