import React from 'react'

import Grid from '@material-ui/core/Grid'

import InputSearchDocumentButton from './components/InputSearchDocumentButton'
import InputSearchDocumentRegex from './components/InputSearchDocumentRegex'
import InputSearchDocumentSimple from './components/InputSearchDocumentSimple'
import { ODD_REGEX } from '../../../constants'

type InputSearchDocumentProps = {
  placeholder?: string
  defaultSearchInput?: string
  setDefaultSearchInput?: (newSearchInput: string) => void
  defaultInputMode?: 'simple' | 'regex'
  setdefaultInputMode?: (newInputMode: 'simple' | 'regex') => void
  onSearchDocument: (newInputText: string) => void
  noInfoIcon?: boolean
  noClearIcon?: boolean
  noSearchIcon?: boolean
  sqareInput?: boolean
}
const InputSearchDocument: React.FC<InputSearchDocumentProps> = ({ ...props }) => {
  return (
    <Grid container direction="column" alignItems="flex-end">
      {props.defaultInputMode && props.setdefaultInputMode && (
        <>
          <Grid item style={{ marginBottom: 8, width: '100%' }}>
            {props.defaultInputMode === 'simple' && <InputSearchDocumentSimple {...props} />}

            {props.defaultInputMode === 'regex' && <InputSearchDocumentRegex {...props} />}
          </Grid>
          {!!ODD_REGEX && (
            <Grid item>
              <InputSearchDocumentButton
                currentMode={props.defaultInputMode}
                onChangeMode={props.setdefaultInputMode}
              />
            </Grid>
          )}
        </>
      )}
    </Grid>
  )
}

export default InputSearchDocument
