/**
 * @fileoverview Question selector dialog component for FHIR questionnaire responses.
 * This component provides a dialog interface for selecting specific questions
 * from FHIR questionnaires for export in pivot format.
 */

import React, { memo, useCallback, useDeferredValue, useEffect, useMemo, useState, useRef } from 'react'
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
 * FHIR Types (minimal definitions)
 ***********************************/

/**
 * Minimal FHIR item interface representing questionnaire items.
 */
interface FhirItem {
  linkId: string
  text: string
  type: string
  item?: FhirItem[]
}

/**
 * Minimal FHIR questionnaire resource interface.
 */
interface QuestionnaireResource {
  id: string
  title?: string
  name?: string
  item?: FhirItem[]
}

/**
 * FHIR bundle entry interface.
 */
interface BundleEntry {
  resource: QuestionnaireResource
}

/**
 * FHIR bundle interface containing questionnaire entries.
 */
interface Bundle {
  entry: BundleEntry[]
}

/**
 * Interface representing a leaf question in the questionnaire hierarchy.
 * This is used for the flattened question structure in the selector.
 */
export interface QuestionLeaf {
  linkId: string
  text: string
  type: string
  path: string[]
  breadcrumb: string
}

/**
 * Props interface for the QuestionSelectorDialog component.
 */
interface QuestionSelectorDialogProps {
  open: boolean
  onClose: () => void
  selectedQuestions: QuestionLeaf[]
  onDefaultQuestionnaireIds: (questionnaireIds: string[]) => void
  onConfirm: (selected: QuestionLeaf[], selectedQuestionnaireIds: string[]) => void
}

/***********************************
 * Utility Functions
 ***********************************/

/**
 * Normalizes a string for search by converting to lowercase and removing diacritics.
 *
 * @param {string} str - String to normalize
 * @returns {string} Normalized string
 */
const normalize = (str: string) =>
  str
    .toLocaleLowerCase('fr-FR')
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')

/**
 * Checks if a linkId starts with the F_MATER_ prefix.
 *
 * @param {string} linkId - Link ID to check
 * @returns {boolean} True if linkId starts with F_MATER_
 */
const startsWithFMater = (linkId: string) => linkId.startsWith('F_MATER_')

/**
 * Recursively collects leaf questions from a FHIR questionnaire item hierarchy.
 * Only includes items that start with F_MATER_ and have no children.
 *
 * @param {FhirItem[] | undefined} items - Array of FHIR items to process
 * @param {string[]} parents - Breadcrumb trail of parent item names
 * @param {QuestionLeaf[]} collector - Array to collect leaf questions
 * @returns {QuestionLeaf[]} Array of leaf questions
 */
function collectLeaves(
  items: FhirItem[] | undefined,
  parents: string[] = [],
  collector: QuestionLeaf[] = []
): QuestionLeaf[] {
  if (!items) return collector
  items.forEach((item) => {
    const newParents = [...parents, item.text ?? item.linkId]
    const hasChildren = Array.isArray(item.item) && item.item.length > 0

    if (item.type !== 'group' && startsWithFMater(item.linkId)) {
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

/**
 * Builds initial checked state map from selected questions.
 * Maps questionnaire IDs to sets of selected question link IDs.
 *
 * @param {Bundle} bundle - FHIR bundle containing questionnaires
 * @param {QuestionLeaf[]} selected - Array of previously selected questions
 * @returns {Map<string, Set<string>>} Map of questionnaire ID to selected question IDs
 */
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
 * Memoized Question Row Component
 ***********************************/

/**
 * Memoized component for rendering individual question rows in the selector.
 *
 * @param {Object} props - Component props
 * @param {QuestionLeaf} props.question - Question data to display
 * @param {boolean} props.isChecked - Whether the question is selected
 * @param {Function} props.toggle - Function to toggle question selection
 * @returns {JSX.Element} Question row component
 */
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
 * Main Dialog Component
 ***********************************/

/**
 * Dialog component for selecting questions from FHIR questionnaires.
 *
 * Features:
 * - Fetches active questionnaires from FHIR API
 * - Displays hierarchical question structure
 * - Provides search functionality with deferred queries
 * - Supports bulk selection/deselection
 * - Shows selected questions as removable chips
 * - Maintains selection state across questionnaires
 *
 * @param {QuestionSelectorDialogProps} props - Component props
 * @returns {JSX.Element} The question selector dialog
 */
const QuestionSelectorDialog: React.FC<QuestionSelectorDialogProps> = ({
  open,
  onClose,
  selectedQuestions,
  onDefaultQuestionnaireIds,
  onConfirm
}) => {
  const [bundle, setBundle] = useState<Bundle>({ entry: [] })
  const [selectedQuestionnaireId, setSelectedQuestionnaireId] = useState<string>('')
  const [checkedByQuestionnaire, setCheckedByQuestionnaire] = useState<Map<string, Set<string>>>(new Map())
  const [inputQuery, setInputQuery] = useState('')
  const deferredQuery = useDeferredValue(inputQuery)

  const fetch = useCallback(async () => {
    try {
      const { data } = await apiFhir.get<Bundle>('/Questionnaire?status=active')
      setBundle(data)
    } catch (e) {
      console.error(e)
    }
  }, [])

  useEffect(() => {
    fetch()
  }, [fetch])

  /***** DERIVED DATA *****/
  const questionnaires = useMemo(
    () =>
      bundle.entry
        .filter(
          (e) =>
            e.resource.name === 'APHPEDSQuestionnaireFicheHospitalisation' ||
            e.resource.name === 'APHPEDSQuestionnaireFicheGrossesse'
        )
        .map((e) => e.resource),
    [bundle]
  )

  const questionnairesIds = questionnaires.map((q) => q.id)

  useEffect(() => {
    if (questionnaires.length > 0 && !selectedQuestionnaireId) {
      setSelectedQuestionnaireId(questionnaires[0].id)
    }
  }, [questionnaires, selectedQuestionnaireId])

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

  const wasOpen = useRef(false)

  useEffect(() => {
    onDefaultQuestionnaireIds(questionnairesIds)
  }, [bundle])

  useEffect(() => {
    const reopened = open && !wasOpen.current
    wasOpen.current = open

    if (!reopened) return
    if (bundle.entry.length === 0) return

    setCheckedByQuestionnaire(buildInitialChecked(bundle, selectedQuestions))

    // si besoin, présélectionner le questionnaire qui contient la premiere question
    if (selectedQuestions.length > 0) {
      const first = selectedQuestions[0].linkId
      const hostQ = bundle.entry.find((e) => collectLeaves(e.resource.item).some((l) => l.linkId === first))?.resource
        .id
      if (hostQ) setSelectedQuestionnaireId(hostQ)
    }
  }, [open, bundle, selectedQuestions])

  const handleQuestionnaireChange = (e: SelectChangeEvent<string>) => {
    setSelectedQuestionnaireId(e.target.value)
    setInputQuery('')
  }

  const toggle = (linkId: string) => {
    setCheckedByQuestionnaire((prev) => {
      const map = new Map(prev)
      const set = new Set(map.get(selectedQuestionnaireId) ?? [])
      if (set.has(linkId)) {
        set.delete(linkId)
      } else {
        set.add(linkId)
      }
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

  const getQuestionnaireIdBySelectedLeaves = () => {
    const questionnaireIds = new Set<string>()
    checkedByQuestionnaire.forEach((set, qId) => {
      if (set.size > 0) {
        questionnaireIds.add(qId)
      }
    })
    return Array.from(questionnaireIds)
  }

  const handleConfirm = () => {
    const pivotQuestionnaireIds = getQuestionnaireIdBySelectedLeaves()
    onConfirm(allSelectedLeaves, pivotQuestionnaireIds)
    setInputQuery('') // reset search input
    setCheckedByQuestionnaire(new Map()) // reset checked state
    onClose()
  }

  const handleClose = () => {
    setInputQuery('') // reset search input
    setCheckedByQuestionnaire(new Map()) // reset checked state
    onClose()
  }

  return (
    <Dialog open={open} maxWidth="md" fullWidth>
      <DialogTitle>
        <span>Sélection des questions</span>
        <FormControl sx={{ ml: 2, minWidth: 200 }} size="small">
          <InputLabel id="questionnaire-select-label">Dossiers de Spécialité</InputLabel>
          <Select
            labelId="questionnaire-select-label"
            value={selectedQuestionnaireId}
            label="Dossiers de Spécialité"
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

        <Stack direction="row" justifyContent="flex-end" sx={{ mb: 1 }}>
          <Button size="small" disabled={filteredLeaves.length === 0} onClick={handleToggleAll}>
            {allFilteredSelected ? 'Tout désélectionner' : 'Tout sélectionner'}
          </Button>
        </Stack>

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
          padding="12px"
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
        <Button onClick={handleClose}>Annuler</Button>
        <Button variant="contained" onClick={handleConfirm}>
          Valider ({allSelectedLeaves.length})
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default QuestionSelectorDialog
