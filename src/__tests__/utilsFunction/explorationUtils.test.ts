import { describe, it, expect } from 'vitest'
import { checkSearchParamsErrors, getCohortDataAccess } from 'utils/explorationUtils'
import { accessType } from 'types/scope'
import { GroupRights } from 'types'

describe('explorationUtils.getCohortDataAccess', () => {
  it('retourne NOMINAL dès que la lecture nominative est autorisée', () => {
    expect(getCohortDataAccess({ read_patient_nomi: true })).toBe(accessType.NOMINAL)
    expect(getCohortDataAccess({ read_patient_nomi: true, read_patient_pseudo: true })).toBe(accessType.NOMINAL)
    expect(getCohortDataAccess({ read_patient_nomi: true, read_patient_pseudo: false })).toBe(accessType.NOMINAL)
  })

  it('retourne PSEUDO quand seule la lecture pseudonymisée est autorisée', () => {
    expect(getCohortDataAccess({ read_patient_nomi: false, read_patient_pseudo: true })).toBe(accessType.PSEUDO)
    expect(getCohortDataAccess({ read_patient_pseudo: true })).toBe(accessType.PSEUDO)
  })

  it("est basé sur la lecture, pas sur l'export : export nominatif + lecture pseudo => PSEUDO", () => {
    expect(
      getCohortDataAccess({ export_csv_xlsx_nomi: true, read_patient_nomi: false, read_patient_pseudo: true })
    ).toBe(accessType.PSEUDO)
  })

  it('retourne undefined quand les droits sont inconnus ou vides', () => {
    expect(getCohortDataAccess(undefined)).toBeUndefined()
    expect(getCohortDataAccess({})).toBeUndefined()
    expect(getCohortDataAccess({ read_patient_nomi: false, read_patient_pseudo: false })).toBeUndefined()
    // un droit d'export seul ne suffit pas à qualifier la consultation
    expect(getCohortDataAccess({ export_csv_xlsx_nomi: true } as GroupRights)).toBeUndefined()
  })
})

describe('explorationUtils.checkSearchParamsErrors - minPatients', () => {
  it('conserve un nombre valide', () => {
    const { changed, newSearchParams } = checkSearchParamsErrors(new URLSearchParams('minPatients=10'))
    expect(changed).toBe(false)
    expect(newSearchParams.get('minPatients')).toBe('10')
  })

  it.each(['abc', '-3', '2024-01-01'])('retire une valeur invalide (%s)', (value) => {
    const { changed, newSearchParams } = checkSearchParamsErrors(new URLSearchParams(`minPatients=${value}`))
    expect(changed).toBe(true)
    expect(newSearchParams.has('minPatients')).toBe(false)
  })
})
