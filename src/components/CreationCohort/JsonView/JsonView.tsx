import React from 'react'
import AceEditor from 'react-ace'

import 'ace-builds'
import 'ace-builds/webpack-resolver'

import 'ace-builds/src-noconflict/mode-json'
import 'ace-builds/src-noconflict/theme-xcode'

import useStyles from './styles'

type JsonViewProps = {
  defaultJson: string
  onChangeJson: (newJson: string) => void
}

const JsonView: React.FC<JsonViewProps> = (props) => {
  const { classes } = useStyles()

  const { defaultJson } = props

  return (
    <AceEditor
      className={classes.root}
      mode="json"
      theme="xcode"
      onChange={() => null}
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
