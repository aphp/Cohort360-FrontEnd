import * as monaco from 'monaco-editor'
import editorWorker from 'monaco-editor/esm/vs/editor/editor.worker?worker'
import jsonWorker from 'monaco-editor/esm/vs/language/json/json.worker?worker'
import { loader } from '@monaco-editor/react'

// Self-host Monaco: empêche @monaco-editor/loader de fetch cdn.jsdelivr.net
// (egress bloqué dans les pods k8s APHP -> editor jamais initialisé en CI/prod).
;(self as unknown as { MonacoEnvironment: monaco.Environment }).MonacoEnvironment = {
  getWorker(_workerId, label) {
    if (label === 'json') return new jsonWorker()
    return new editorWorker()
  }
}

loader.config({ monaco })
