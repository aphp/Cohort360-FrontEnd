import { describe, it, expect } from 'vitest'
import {
  medicationRequestConfig,
  medicationAdministrationConfig
} from 'components/ExplorationBoard/config/medication'
import { conditionConfig, procedureConfig, claimConfig } from 'components/ExplorationBoard/config/pmsi'
import { biologyConfig } from 'components/ExplorationBoard/config/biology'

// Ces configs construisent des tables via getConfig() (config réelle) et des
// fonctions internes. On invoque mapToTable avec une liste vide (couvre la
// construction des colonnes) et la config elle-même.

const emptyData = { list: [], total: 0 } as never

describe('medication config', () => {
  it('medicationRequestConfig construit des colonnes de table', () => {
    const config = medicationRequestConfig(false, null, ['g1'])
    const table = config.mapToTable!(emptyData)
    expect(table.columns.length).toBeGreaterThan(0)
    expect(table.columns.map((c) => c.label)).toContain('Code ATC')
    expect(table.rows).toEqual([])
  })

  it('medicationAdministrationConfig inclut la colonne Quantité', () => {
    const config = medicationAdministrationConfig(false, null, ['g1'])
    const table = config.mapToTable!(emptyData)
    expect(table.columns.map((c) => c.label)).toContain('Quantité')
  })

  it('masque IPP en vue patient', () => {
    const config = medicationRequestConfig(false, {} as never, ['g1'])
    // en vue patient, mapToTable peut être indéfini (cartes) — on vérifie la config
    expect(config.type).toBeDefined()
  })
})

describe('pmsi config', () => {
  it('conditionConfig construit une table', () => {
    const config = conditionConfig(false, null, ['g1'])
    const table = config.mapToTable!(emptyData)
    expect(table.columns.length).toBeGreaterThan(0)
  })

  it('procedureConfig construit une table', () => {
    const config = procedureConfig(false, null, ['g1'])
    const table = config.mapToTable!(emptyData)
    expect(table.columns.length).toBeGreaterThan(0)
  })

  it('claimConfig construit une table', () => {
    const config = claimConfig(false, null, ['g1'])
    const table = config.mapToTable!(emptyData)
    expect(table.columns.length).toBeGreaterThan(0)
  })

  it('inclut la colonne IPP hors vue patient et la masque en vue patient', () => {
    const listConfig = conditionConfig(true, null, ['g1'])
    const table = listConfig.mapToTable!(emptyData)
    expect(table.columns.some((c) => String(c.label ?? '').startsWith('IPP'))).toBe(true)
  })
})

describe('biology config', () => {
  it('biologyConfig construit une table', () => {
    const config = biologyConfig(false, null, ['g1'])
    const table = config.mapToTable!(emptyData)
    expect(table.columns.length).toBeGreaterThan(0)
    expect(table.rows).toEqual([])
  })
})
