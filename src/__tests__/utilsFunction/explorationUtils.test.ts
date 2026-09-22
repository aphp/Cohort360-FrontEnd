import { describe, it, expect } from 'vitest'
import { getCohortDataAccess } from 'utils/explorationUtils'
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
