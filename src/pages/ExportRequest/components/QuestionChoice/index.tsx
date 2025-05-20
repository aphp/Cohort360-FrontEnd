import React, { memo, useCallback, useDeferredValue, useEffect, useMemo, useState } from 'react'
import {
  Box,
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  List,
  ListItem,
  ListItemSecondaryAction,
  ListItemText,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography
} from '@mui/material'
import { SelectChangeEvent } from '@mui/material/Select'
import Chip from 'components/ui/Chip'

import apiFhir from 'services/apiFhir'

/***********************************
 * Types FHIR minimalistes
 ***********************************/
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

/***********************************
 * Utils
 ***********************************/
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

function buildInitialChecked(bundle: Bundle, selected: QuestionLeaf[]): Map<string, Set<string>> {
  const map = new Map<string, Set<string>>()

  // index linkId ➜ questionnaireId
  const linkToQId = new Map<string, string>()
  bundle.entry.forEach((e) => {
    collectLeaves(e.resource.item).forEach((leaf) => linkToQId.set(leaf.linkId, e.resource.id))
  })

  selected.forEach(({ linkId }) => {
    const qId = linkToQId.get(linkId)
    if (!qId) return
    const set = map.get(qId) ?? new Set<string>()
    set.add(linkId)
    map.set(qId, set)
  })

  return map
}

/***********************************
 * Child row (mémoïsé)
 ***********************************/
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

/***********************************
 * Main component
 ***********************************/
const QuestionSelectorDialog: React.FC<QuestionSelectorDialogProps> = ({
  open,
  onClose,
  selectedQuestions,
  onConfirm
}) => {
  /***** STATE *****/
  const [bundle, setBundle] = useState<Bundle>({ entry: [] })
  const [selectedQuestionnaireId, setSelectedQuestionnaireId] = useState<string>('')
  const [checkedByQuestionnaire, setCheckedByQuestionnaire] = useState<Map<string, Set<string>>>(new Map())
  const [inputQuery, setInputQuery] = useState('')
  const deferredQuery = useDeferredValue(inputQuery)

  /***** FETCH *****/
  const fetch = useCallback(async () => {
    try {
      const { data } = await apiFhir.get<Bundle>('/Questionnaire?status=active')
      setBundle(data)
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error(e)
    }
  }, [])

  useEffect(() => {
    fetch()
  }, [fetch])

  /***** DERIVED DATA *****/
  const questionnaires = useMemo(() => bundle.entry.map((e) => e.resource), [bundle])

  const leaves = useMemo(() => {
    const q = questionnaires.find((qq) => qq.id === selectedQuestionnaireId)
    return q ? collectLeaves(q.item) : []
  }, [questionnaires, selectedQuestionnaireId])

  const filteredLeaves = useMemo(() => {
    if (!deferredQuery) return leaves
    const needle = normalize(deferredQuery)
    return leaves.filter((q) => [q.text, q.linkId, q.breadcrumb].some((field) => normalize(field).includes(needle)))
  }, [leaves, deferredQuery])

  const currentChecked = useMemo<Set<string>>(
    () => checkedByQuestionnaire.get(selectedQuestionnaireId) ?? new Set<string>(),
    [checkedByQuestionnaire, selectedQuestionnaireId]
  )

  const allFilteredSelected = filteredLeaves.length > 0 && filteredLeaves.every((l) => currentChecked.has(l.linkId))

  const allSelectedLeaves = useMemo(() => {
    const all: QuestionLeaf[] = []
    questionnaires.forEach((q) => {
      const leavesForQ = collectLeaves(q.item)
      const ids = checkedByQuestionnaire.get(q.id)
      if (ids) all.push(...leavesForQ.filter((l) => ids.has(l.linkId)))
    })
    return all
  }, [checkedByQuestionnaire, questionnaires])

  /***** EFFECT : synchro initiale *****/
  useEffect(() => {
    if (bundle.entry.length === 0) return

    setCheckedByQuestionnaire(buildInitialChecked(bundle, selectedQuestions))

    if (!selectedQuestionnaireId && selectedQuestions.length > 0) {
      const firstLink = selectedQuestions[0].linkId
      const qId = bundle.entry.find((e) => collectLeaves(e.resource.item).some((l) => l.linkId === firstLink))?.resource
        .id
      if (qId) setSelectedQuestionnaireId(qId)
    }
  }, [bundle, selectedQuestions, selectedQuestionnaireId])

  /***** HANDLERS *****/
  const handleQuestionnaireChange = (e: SelectChangeEvent<string>) => {
    setSelectedQuestionnaireId(e.target.value as string)
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

  const handleToggleAll = useCallback(() => {
    setCheckedByQuestionnaire((prev) => {
      const map = new Map(prev)
      const set = new Set(map.get(selectedQuestionnaireId) ?? [])
      const allIds = filteredLeaves.map((l) => l.linkId)
      const alreadyAll = allIds.every((id) => set.has(id))
      if (alreadyAll) {
        allIds.forEach((id) => set.delete(id))
      } else {
        allIds.forEach((id) => set.add(id))
      }
      map.set(selectedQuestionnaireId, set)
      return map
    })
  }, [filteredLeaves, selectedQuestionnaireId])

  const handleRemoveChip = (linkId: string) => {
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

  /***** RENDER *****/
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

        {/* Toggle all */}
        <Stack direction="row" justifyContent="flex-end" sx={{ mb: 1 }}>
          <Button size="small" disabled={filteredLeaves.length === 0} onClick={handleToggleAll}>
            {allFilteredSelected ? 'Tout désélectionner' : 'Tout sélectionner'}
          </Button>
        </Stack>

        {/* Liste des questions */}
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
      </DialogContent>
      {allSelectedLeaves.length > 0 && (
        <Box
          // container
          // item
          // xs={selectedQuestions.length > 0 ? 12 : 3.59}
          // alignItems={selectedQuestions.length ? 'flex-start' : 'center'}
          // border="1px solid rgba(0, 0, 0, 0.25)"
          // borderRadius="4px"
          // padding="6px 1px 6px 8px"
          padding="12px"
          // className="ValueSetField"
          style={{
            maxHeight: 200,
            overflowX: 'hidden',
            overflowY: 'auto',
            backgroundColor: '#D1E2F4'
          }}
        >
          {allSelectedLeaves.map((l) => (
            <Chip
              key={l.linkId}
              label={l.text || l.linkId}
              onDelete={() => handleRemoveChip(l.linkId)}
              style={{ backgroundColor: '#f7f7f7' }}
            />
          ))}
        </Box>
      )}
      <DialogActions>
        <Button onClick={onClose}>Annuler</Button>
        <Button variant="contained" onClick={handleConfirm}>
          Valider ({allSelectedLeaves.length})
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default QuestionSelectorDialog
