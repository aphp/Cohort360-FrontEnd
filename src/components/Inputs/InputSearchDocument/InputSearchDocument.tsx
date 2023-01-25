import React from 'react'

import Grid from '@mui/material/Grid'

import InputSearchDocumentSimple from './components/InputSearchDocumentSimple'

type InputSearchDocumentProps = {
  placeholder?: string
  defaultSearchInput?: string
  setDefaultSearchInput?: (newSearchInput: string) => void
  onSearchDocument: (newInputText: string) => void
  noInfoIcon?: boolean
  noClearIcon?: boolean
  noSearchIcon?: boolean
  squareInput?: boolean
}
const InputSearchDocument: React.FC<InputSearchDocumentProps> = ({ ...props }) => {
  return (
    <Grid container direction="column" alignItems="flex-end">
      <Grid item style={{ marginBottom: 8, width: '100%' }}>
        <InputSearchDocumentSimple {...props} />
      </Grid>
    </Grid>
  )
}

export default InputSearchDocument
