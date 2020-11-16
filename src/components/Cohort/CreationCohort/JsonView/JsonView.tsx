import React from 'react'
import AceEditor from 'react-ace'

import 'ace-builds/src-noconflict/mode-json'
import 'ace-builds/src-noconflict/theme-xcode'

import useStyles from './styles'

type JsonViewProps = {
  defaultJson: string
  cursorStart: number
  onChangeJson: (newJson: string) => void
}

const JsonView: React.FC<JsonViewProps> = (props) => {
  const classes = useStyles()

  const { defaultJson, onChangeJson } = props

  return (
    <AceEditor
      className={classes.root}
      mode="json"
      theme="xcode"
      onChange={onChangeJson}
      showPrintMargin
      showGutter
      highlightActiveLine
      value={defaultJson}
      setOptions={{
        enableBasicAutocompletion: true,
        enableLiveAutocompletion: true,
        enableSnippets: true,
        showLineNumbers: true,
        tabSize: 2
      }}
    />
  )
}

export default JsonView
