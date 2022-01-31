import React, { useState } from 'react'

import Grid from '@material-ui/core/Grid'

import InputSearchDocumentButton from './components/InputSearchDocumentButton'
import InputSearchDocumentRegex from './components/InputSearchDocumentRegex'
import InputSearchDocumentSimple from './components/InputSearchDocumentSimple'

type InputSearchDocumentProps = {
  placeholder?: string
  defaultSearchInput?: string
  setDefaultSearchInput?: (newSearchInput: string) => void
  onSearchDocument: (newInputText: string) => void
  noInfoIcon?: boolean
  noClearIcon?: boolean
  noSearchIcon?: boolean
}

const InputSearchDocument: React.FC<InputSearchDocumentProps> = ({ ...props }) => {
  const [inputMode, setInputMode] = useState<'simple' | 'regex'>('simple')

  return (
    <Grid container direction="column" justifyContent="flex-end">
      <Grid item>
        {inputMode === 'simple' && <InputSearchDocumentSimple {...props} />}

        {inputMode === 'regex' && <InputSearchDocumentRegex {...props} />}
      </Grid>

      <Grid item>
        <InputSearchDocumentButton currentMode={inputMode} onChangeMode={setInputMode} />
      </Grid>
    </Grid>
  )
}

export default InputSearchDocument
