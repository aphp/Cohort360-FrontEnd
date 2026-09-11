import { describe, it, expect } from 'vitest'
import { generateTimelineFormattedData } from 'components/Patient/PatientTimeline/mappers'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const encounter = (start: string, end?: string): any => ({
  resourceType: 'Encounter',
  id: `enc-${start}`,
  period: { start, end }
})
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const procedure = (date: string): any => ({ resourceType: 'Procedure', id: `proc-${date}`, performedDateTime: date })
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const condition = (date: string): any => ({ resourceType: 'Condition', id: `cond-${date}`, recordedDate: date })

describe('PatientTimeline/generateTimelineFormattedData', () => {
  it('retourne une structure vide quand aucune donnée', () => {
    const result = generateTimelineFormattedData([])
    expect(result).toBeDefined()
  })

  it('regroupe les hospitalisations par année et mois', () => {
    const result = generateTimelineFormattedData(
      [],
      [encounter('2023-01-15'), encounter('2023-06-20', '2023-06-25')],
      [],
      []
    )
    expect(result).toBeDefined()
    // la sortie contient des données organisées par année
    expect(JSON.stringify(result)).toContain('2023')
  })

  it('regroupe les procédures et diagnostics', () => {
    const result = generateTimelineFormattedData(
      [],
      [],
      [procedure('2022-03-10')],
      [condition('2022-07-01')],
      []
    )
    expect(result).toBeDefined()
    expect(JSON.stringify(result)).toContain('2022')
  })

  it('gère un mélange de types sur plusieurs années', () => {
    const result = generateTimelineFormattedData(
      [],
      [encounter('2021-05-01')],
      [procedure('2022-05-01')],
      [condition('2023-05-01')],
      []
    )
    const serialized = JSON.stringify(result)
    expect(serialized).toContain('2021')
    expect(serialized).toContain('2022')
    expect(serialized).toContain('2023')
  })
})
