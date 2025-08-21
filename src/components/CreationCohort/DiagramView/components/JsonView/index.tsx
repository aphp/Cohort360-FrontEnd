import { useAppDispatch, useAppSelector } from 'state'

import React, { useEffect, useMemo, useRef, useState } from 'react'
import MonacoEditor, { type OnMount } from '@monaco-editor/react'
import 'monaco-editor/esm/vs/language/json/monaco.contribution'
import Ajv from 'ajv'
import { useDebounce } from 'utils/debounce'
import JsonDefaultSchema from '../../../../../utils/avjSchema/serializedQuerySchema.json'
import { editJson } from 'state/cohortCreation'
import { formatAjvErrors, safeJsonParse } from 'utils/avjSchema/jsonValidation'
import { Container, EditorWrapper, ErrorMessage, MessageTitle, SuccessMessage } from './styles'
import { Box } from '@mui/material'

interface JsonEditorWithAjvProps {
  onJsonIssuesChange: (canExecuteJson: boolean) => void
  minHeight?: number
  debounceMs?: number
}

const JsonView: React.FC<JsonEditorWithAjvProps> = ({ onJsonIssuesChange, minHeight = 600, debounceMs = 2000 }) => {
  const dispatch = useAppDispatch()

  const request = useAppSelector((state) => state.cohortCreation.request || {})
  const [syntaxError, setSyntaxError] = useState<string | null>(null)
  const [schemaErrors, setSchemaErrors] = useState<string[]>([])

  const [editorValue, setEditorValue] = useState<string>('')
  const didInitPrettyRef = useRef(false)

  const editorRef = useRef<any>(null)
  const monacoRef = useRef<any>(null)

  const debouncedValue = useDebounce(debounceMs, editorValue)

  const didJsonValueChanged = useRef<boolean>(false)

  const validate = useMemo(() => {
    if (!JsonDefaultSchema) return null
    const ajv = new Ajv({
      allErrors: true
    })

    return ajv.compile(JsonDefaultSchema)
  }, [])

  const hasError = Boolean(syntaxError) || schemaErrors.length > 0

  useEffect(() => {
    if (didInitPrettyRef.current) return
    if (!request.json) return

    try {
      setEditorValue(JSON.stringify(JSON.parse(request.json), null, 2))
    } catch {
      setEditorValue(request.json)
    }

    didInitPrettyRef.current = true
  }, [request.json])

  useEffect(() => {
    if (!debouncedValue) {
      setSyntaxError(null)
      setSchemaErrors([])
      return
    }
    // Syntax validation
    const parsed = safeJsonParse(debouncedValue)
    if (!parsed.ok) {
      setSyntaxError(parsed.error)
      setSchemaErrors([])
      return
    }
    setSyntaxError(null)

    //  Schema validation
    if (!validate) {
      setSchemaErrors([])
      return
    }
    const isSchemaValid = validate(parsed.value)
    const errors = isSchemaValid ? [] : formatAjvErrors(validate.errors)
    setSchemaErrors(errors)

    if (!isSchemaValid) return
  }, [debouncedValue, validate])

  useEffect(() => {
    const hasIssues = !!syntaxError || schemaErrors.length > 0
    onJsonIssuesChange(!didJsonValueChanged.current ? true : hasIssues)
  }, [syntaxError, schemaErrors, onJsonIssuesChange])

  const handleMount: OnMount = (editor, monaco) => {
    editorRef.current = editor
    monacoRef.current = monaco

    try {
      ;(monaco as any).languages.json?.jsonDefaults?.setDiagnosticsOptions({
        validate: true,
        allowComments: false
      })
    } catch (e) {
      console.error('Error mounting Monaco editor', e)
    }
  }

  return (
    <Container>
      <EditorWrapper hasError={!!hasError}>
        <MonacoEditor
          height={minHeight}
          language="json"
          theme="vs-dark"
          value={editorValue}
          onChange={(v) => {
            const next = v ?? ''
            didJsonValueChanged.current = true
            setEditorValue(next)
            dispatch(editJson(next))
          }}
          onMount={handleMount}
          options={{
            minimap: { enabled: false },
            fontSize: 14,
            fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
            wordWrap: 'on',
            scrollBeyondLastLine: false,
            automaticLayout: true,
            formatOnPaste: true,
            formatOnType: false
          }}
        />
      </EditorWrapper>

      <Box sx={{ mt: 1 }}>
        {syntaxError && (
          <ErrorMessage>
            <MessageTitle>Erreur de syntaxe</MessageTitle>
            <span>{syntaxError}</span>
          </ErrorMessage>
        )}

        {!syntaxError && schemaErrors.length > 0 && (
          <ErrorMessage>
            <MessageTitle>Erreur de validation</MessageTitle>
            <span>{schemaErrors[0]}</span>
          </ErrorMessage>
        )}

        {!syntaxError && schemaErrors.length === 0 && <SuccessMessage>JSON valide</SuccessMessage>}
      </Box>
    </Container>
  )
}

export default JsonView
