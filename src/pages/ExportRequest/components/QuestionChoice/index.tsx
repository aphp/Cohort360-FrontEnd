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
  // Chip,
  Stack
} from '@mui/material'
import { SelectChangeEvent } from '@mui/material/Select'
import Chip from 'components/ui/Chip'

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
  selectedQuestions: QuestionLeaf[]
  onConfirm: (selected: QuestionLeaf[]) => void
}

/**
 * Mise en minuscules + suppression des accents pour une comparaison
 * insensible à la casse et aux diacritiques.
 */
const normalize = (str: string) =>
  str
    .toLocaleLowerCase('fr-FR')
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')

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
      <ListItem disableGutters>
        <Checkbox
          edge="start"
          checked={isChecked}
          onChange={() => toggle(question.linkId)}
          tabIndex={-1}
          disableRipple
          inputProps={{ 'aria-labelledby': labelId }}
        />
        <ListItemText
          id={labelId}
          primary={`${question.linkId} — ${question.text} — [ ${question.type} ]`}
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

const QuestionSelectorDialog: React.FC<QuestionSelectorDialogProps> = ({
  open,
  onClose,
  selectedQuestions,
  onConfirm
}) => {
  const [bundle, setBundle] = useState<Bundle>({
    entry: []
  })
  const [selectedQuestionnaireId, setSelectedQuestionnaireId] = useState<string>('')
  const [checkedByQuestionnaire, setCheckedByQuestionnaire] = useState<Map<string, Set<string>>>(new Map())
  const [inputQuery, setInputQuery] = useState('')
  const deferredQuery = useDeferredValue(inputQuery)

  const handleQuestionnaireChange = (event: SelectChangeEvent) => {
    const value = event.target.value
    setSelectedQuestionnaireId(value)
    setInputQuery('')
  }

  const toggle = (linkId: string) => {
    setCheckedByQuestionnaire((prev) => {
      const map = new Map(prev)
      const set = new Set(map.get(selectedQuestionnaireId) ?? [])
      set.has(linkId) ? set.delete(linkId) : set.add(linkId)
      map.set(selectedQuestionnaireId, set)
      return map
    })
  }

  const handleRemove = (linkId: string) => {
    setCheckedByQuestionnaire((prev) => {
      const map = new Map(prev)
      map.forEach((set) => set.delete(linkId))
      return map
    })
  }

  const handleConfirm = () => {
    onConfirm(allSelectedLeaves)
    onClose()
  }

  const questionnaires = useMemo(() => bundle.entry.map((e) => e.resource), [bundle])

  // Leaves for current questionnaire
  const leaves = useMemo(() => {
    const q = questionnaires.find((qq) => qq.id === selectedQuestionnaireId)
    return q ? collectLeaves(q.item) : []
  }, [questionnaires, selectedQuestionnaireId])

  // Current checked set helper
  // Memoize current checklist to avoid new Set creation on each render
  const currentChecked = useMemo<Set<string>>(
    () => checkedByQuestionnaire.get(selectedQuestionnaireId) ?? new Set<string>(),
    [checkedByQuestionnaire, selectedQuestionnaireId]
  )

  const filteredLeaves = useMemo(() => {
    if (!deferredQuery) return leaves
    const needle = normalize(deferredQuery)

    return leaves.filter((q) => {
      return (
        normalize(q.text).includes(needle) ||
        normalize(q.linkId).includes(needle) ||
        normalize(q.breadcrumb).includes(needle)
      )
    })
  }, [leaves, deferredQuery])

  const allSelectedLeaves = useMemo(() => {
    const all: QuestionLeaf[] = []
    questionnaires.forEach((q) => {
      const leavesForQ = collectLeaves(q.item)
      const ids = checkedByQuestionnaire.get(q.id)
      if (ids) all.push(...leavesForQ.filter((l) => ids.has(l.linkId)))
    })
    return all
  }, [checkedByQuestionnaire, questionnaires])

  console.log('manelle allSelectedLeaves', allSelectedLeaves)
  console.log('manelle filteredLeaves', filteredLeaves)

  const fetch = useCallback(async () => {
    const response = await apiFhir.get('/Questionnaire?status=active')
    setBundle(response.data)
  }, [])

  useEffect(() => {
    fetch()
  }, [fetch])

  return (
    <Dialog open={open} maxWidth="md" fullWidth>
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
            <QuestionRow key={q.linkId} question={q} isChecked={currentChecked.has(q.linkId)} toggle={toggle} />
          ))}
          {filteredLeaves.length === 0 && (
            <Typography variant="body2" sx={{ p: 2 }}>
              Aucune question trouvée.
            </Typography>
          )}
        </List>
        {allSelectedLeaves.length > 0 && (
          <Stack direction="row" spacing={1} sx={{ mt: 2, flexWrap: 'wrap' }}>
            {allSelectedLeaves.map((l) => (
              <Chip
                key={l.linkId}
                label={l.text || l.linkId}
                onDelete={() => handleRemove(l.linkId)}
                // variant="outlined"

                style={{ backgroundColor: '#f7f7f7' }}
              />
            ))}
          </Stack>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Annuler</Button>
        <Button variant="contained" disabled={allSelectedLeaves.length === 0} onClick={handleConfirm}>
          Valider ({allSelectedLeaves.length})
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default QuestionSelectorDialog
