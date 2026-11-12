import { describe, it, expect } from 'vitest'

import {
  EMPTY_PROJECT_DETAILS,
  PURPOSE_OPTIONS,
  isPurposeComplete,
  toProjectDetailsPayload
} from 'pages/ExportRequest/components/ExportPurposeFields/purposes'
import { ExportPurpose } from 'types/export'

const project = { title: 'Projet X', project_leader: 'Jeanne Martin', start_date: null, end_date: null }

describe('PURPOSE_OPTIONS', () => {
  it('propose les quatre finalités dans l’ordre de l’issue', () => {
    expect(PURPOSE_OPTIONS.map((option) => option.label)).toEqual([
      'Appui au soin',
      "Pilotage de l'activité",
      'Recherche interne',
      'Recherche multicentrique'
    ])
    PURPOSE_OPTIONS.forEach((option) => expect(option.definition).not.toBe(''))
  })
})

describe('isPurposeComplete', () => {
  it('refuse un export sans finalité', () => {
    expect(isPurposeComplete(null, project, false)).toBe(false)
  })

  it('accepte une finalité hors recherche interne sans projet', () => {
    expect(isPurposeComplete(ExportPurpose.CARE_SUPPORT, EMPTY_PROJECT_DETAILS, false)).toBe(true)
  })

  it('ignore une date incomplète hors recherche interne', () => {
    expect(isPurposeComplete(ExportPurpose.MULTICENTER_RESEARCH, EMPTY_PROJECT_DETAILS, true)).toBe(true)
  })

  it('accepte la recherche interne avec titre et porteur, sans dates', () => {
    expect(isPurposeComplete(ExportPurpose.INTERNAL_RESEARCH, project, false)).toBe(true)
  })

  it.each([
    ['titre vide', { ...project, title: '' }],
    ['porteur vide', { ...project, project_leader: '' }],
    ['titre en espaces', { ...project, title: '   ' }],
    ['porteur en espaces', { ...project, project_leader: '  ' }]
  ])('refuse la recherche interne avec %s', (_, details) => {
    expect(isPurposeComplete(ExportPurpose.INTERNAL_RESEARCH, details, false)).toBe(false)
  })

  it('refuse une date de fin antérieure à la date de début', () => {
    const details = { ...project, start_date: '2026-06-01', end_date: '2026-05-31' }
    expect(isPurposeComplete(ExportPurpose.INTERNAL_RESEARCH, details, false)).toBe(false)
  })

  it('accepte une date de fin future et une fin égale au début', () => {
    expect(
      isPurposeComplete(
        ExportPurpose.INTERNAL_RESEARCH,
        { ...project, start_date: '2026-06-01', end_date: '2099-12-31' },
        false
      )
    ).toBe(true)
    expect(
      isPurposeComplete(
        ExportPurpose.INTERNAL_RESEARCH,
        { ...project, start_date: '2026-06-01', end_date: '2026-06-01' },
        false
      )
    ).toBe(true)
  })

  it('refuse une date en cours de saisie', () => {
    expect(isPurposeComplete(ExportPurpose.INTERNAL_RESEARCH, project, true)).toBe(false)
  })
})

describe('toProjectDetailsPayload', () => {
  it('envoie le projet nettoyé des espaces en recherche interne', () => {
    const details = { ...project, title: '  Projet X ', project_leader: ' Jeanne Martin', start_date: '2026-06-01' }
    expect(toProjectDetailsPayload(ExportPurpose.INTERNAL_RESEARCH, details)).toEqual({
      title: 'Projet X',
      project_leader: 'Jeanne Martin',
      start_date: '2026-06-01',
      end_date: null
    })
  })

  it('n’envoie aucun projet pour les autres finalités, même saisi auparavant', () => {
    expect(toProjectDetailsPayload(ExportPurpose.ACTIVITY_MANAGEMENT, project)).toBeNull()
  })
})
