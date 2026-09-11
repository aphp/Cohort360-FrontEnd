import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'

const apiGet = vi.fn()
vi.mock('services/apiFhir', () => ({
  default: { get: (...a: any[]) => apiGet(...a) }
}))

import QuestionSelectorDialog from 'pages/ExportRequest/components/QuestionChoice'

const questionnaireBundle = {
  entry: [
    {
      resource: {
        resourceType: 'Questionnaire',
        id: 'q-hospit',
        name: 'FicheHospitalisation',
        item: [
          { linkId: 'F_MATER_1', text: 'Question 1', type: 'string' },
          { linkId: 'F_MATER_2', text: 'Question 2', type: 'choice' }
        ]
      }
    },
    {
      resource: {
        resourceType: 'Questionnaire',
        id: 'q-grossesse',
        name: 'FicheGrossesse',
        item: [{ linkId: 'F_MATER_3', text: 'Question 3', type: 'string' }]
      }
    },
    { resource: { resourceType: 'Questionnaire', id: 'other', name: 'Autre' } }
  ]
}

beforeEach(() => {
  vi.clearAllMocks()
  apiGet.mockResolvedValue({ data: questionnaireBundle })
})

const renderDialog = (open = true) =>
  render(
    <QuestionSelectorDialog
      open={open}
      onClose={vi.fn()}
      selectedQuestions={[]}
      onDefaultQuestionnaireIds={vi.fn()}
      onConfirm={vi.fn()}
    />
  )

describe('QuestionChoice (QuestionSelectorDialog)', () => {
  it('récupère les questionnaires actifs au montage', async () => {
    renderDialog()
    await waitFor(() => {
      expect(apiGet).toHaveBeenCalledWith('/Questionnaire?status=active')
    })
  })

  it('ne rend pas le contenu du dialogue quand fermé', () => {
    renderDialog(false)
    // le titre du dialogue ne doit pas être visible quand open=false
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('affiche le dialogue quand ouvert', async () => {
    renderDialog(true)
    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument()
    })
  })

  it('gère une erreur de fetch sans planter', async () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    apiGet.mockRejectedValue(new Error('network'))
    renderDialog()
    await waitFor(() => {
      expect(errorSpy).toHaveBeenCalled()
    })
    errorSpy.mockRestore()
  })
})
