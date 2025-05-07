import React, { useMemo, useState, useDeferredValue, memo, useCallback, useEffect } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  List,
  ListItem,
  ListItemSecondaryAction,
  Checkbox,
  ListItemText,
  TextField,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Stack
} from '@mui/material'
import { SelectChangeEvent } from '@mui/material/Select'
import apiFhir from 'services/apiFhir'

/**
 * Types matching the minimal subset of FHIR resources we consume.
 */
interface FhirItem {
  linkId: string
  text: string
  type: string
  item?: FhirItem[]
}

interface QuestionnaireResource {
  id: string
  title?: string
  name?: string
  item?: FhirItem[]
}

interface BundleEntry {
  resource: QuestionnaireResource
}

interface Bundle {
  entry: BundleEntry[]
}

export interface QuestionLeaf {
  linkId: string
  text: string
  type: string
  path: string[]
  breadcrumb: string
}

interface QuestionSelectorDialogProps {
  open: boolean
  onClose: () => void
  // bundle: Bundle
  // onConfirm: (selected: QuestionLeaf[]) => void
}

const startsWithFMater = (linkId: string) => linkId.startsWith('F_MATER_')

function collectLeaves(
  items: FhirItem[] | undefined,
  parents: string[] = [],
  collector: QuestionLeaf[] = []
): QuestionLeaf[] {
  if (!items) return collector
  items.forEach((item) => {
    const newParents = [...parents, item.text ?? item.linkId]
    const hasChildren = Array.isArray(item.item) && item.item.length > 0
    if (!hasChildren && startsWithFMater(item.linkId)) {
      collector.push({
        linkId: item.linkId,
        text: item.text ?? '',
        type: item.type,
        path: parents,
        breadcrumb: parents.join(' › ')
      })
    }
    if (hasChildren) collectLeaves(item.item, newParents, collector)
  })
  return collector
}

const QuestionRow = memo(
  ({ question, isChecked, toggle }: { question: QuestionLeaf; isChecked: boolean; toggle: (id: string) => void }) => {
    const labelId = `checkbox-list-label-${question.linkId}`
    return (
      <ListItem button onClick={() => toggle(question.linkId)}>
        <Checkbox
          edge="start"
          checked={isChecked}
          tabIndex={-1}
          disableRipple
          inputProps={{ 'aria-labelledby': labelId }}
        />
        <ListItemText
          id={labelId}
          primary={`${question.linkId} — ${question.text} (${question.type})`}
          secondary={
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              {question.breadcrumb}
            </Typography>
          }
        />
        <ListItemSecondaryAction />
      </ListItem>
    )
  },
  (prev, next) => prev.isChecked === next.isChecked && prev.question === next.question
)

const QuestionSelectorDialog: React.FC<QuestionSelectorDialogProps> = ({ open, onClose }) => {
  const [bundle, setBundle] = useState<Bundle>({
    entry: []
  })
  const fetch = useCallback(async () => {
    const response = await apiFhir.get('/Questionnaire?status=active')
    setBundle(response.data)
  }, [])

  useEffect(() => {
    fetch()
  }, [fetch])

  const onConfirm = (selectedItem: QuestionLeaf[]) => {
    console.log('manelle selectedItem', selectedItem)
  }
  const questionnaires = useMemo(() => bundle.entry.map((e) => e.resource), [bundle])

  const [selectedQuestionnaireId, setSelectedQuestionnaireId] = useState<string>(questionnaires[0]?.id ?? '')
  const [inputQuery, setInputQuery] = useState('')
  const deferredQuery = useDeferredValue(inputQuery)
  const [checked, setChecked] = useState<Set<string>>(new Set())

  const handleQuestionnaireChange = (event: SelectChangeEvent) => {
    const value = event.target.value as string
    setSelectedQuestionnaireId(value)
    setInputQuery('')
    setChecked(new Set())
  }

  const leaves = useMemo(() => {
    const q = questionnaires.find((qq) => qq.id === selectedQuestionnaireId)
    return q ? collectLeaves(q.item) : []
  }, [questionnaires, selectedQuestionnaireId])

  const filteredLeaves = useMemo(() => {
    if (!deferredQuery) return leaves
    const lower = deferredQuery.toLowerCase()
    return leaves.filter(
      (q) =>
        q.text.toLowerCase().includes(lower) ||
        q.linkId.toLowerCase().includes(lower) ||
        q.breadcrumb.toLowerCase().includes(lower)
    )
  }, [leaves, deferredQuery])

  const toggle = (linkId: string) => {
    setChecked((prev) => {
      const next = new Set(prev)
      next.has(linkId) ? next.delete(linkId) : next.add(linkId)
      return next
    })
  }

  const selectedLeaves = useMemo(() => leaves.filter((l) => checked.has(l.linkId)), [leaves, checked])

  const handleRemove = (linkId: string) => toggle(linkId)

  const handleConfirm = () => onConfirm(selectedLeaves)

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        Sélection des questions
        <FormControl sx={{ ml: 2, minWidth: 200 }} size="small">
          <InputLabel id="questionnaire-select-label">Formulaire</InputLabel>
          <Select
            labelId="questionnaire-select-label"
            value={selectedQuestionnaireId}
            label="Formulaire"
            onChange={handleQuestionnaireChange}
          >
            {questionnaires.map((q) => (
              <MenuItem key={q.id} value={q.id}>
                {q.title ?? q.name ?? q.id}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </DialogTitle>
      <DialogContent dividers>
        <TextField
          fullWidth
          margin="dense"
          variant="outlined"
          placeholder="Rechercher..."
          value={inputQuery}
          onChange={(e) => setInputQuery(e.target.value)}
        />
        <List sx={{ maxHeight: 400, overflow: 'auto' }}>
          {filteredLeaves.map((q) => (
            <QuestionRow key={q.linkId} question={q} isChecked={checked.has(q.linkId)} toggle={toggle} />
          ))}
          {filteredLeaves.length === 0 && (
            <Typography variant="body2" sx={{ p: 2 }}>
              Aucune question trouvée.
            </Typography>
          )}
        </List>
        {selectedLeaves.length > 0 && (
          <Stack direction="row" spacing={1} sx={{ mt: 2, flexWrap: 'wrap' }}>
            {selectedLeaves.map((l) => (
              <Chip
                key={l.linkId}
                label={l.text || l.linkId}
                onDelete={() => handleRemove(l.linkId)}
                variant="outlined"
                sx={{ mb: 1 }}
              />
            ))}
          </Stack>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Annuler</Button>
        <Button variant="contained" disabled={selectedLeaves.length === 0} onClick={handleConfirm}>
          Valider ({selectedLeaves.length})
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default QuestionSelectorDialog
