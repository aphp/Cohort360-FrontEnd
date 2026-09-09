import { describe, it, expect } from 'vitest'
import { getCohortSensitivity } from 'utils/explorationUtils'
import { accessType } from 'types/scope'
import { GroupRights } from 'types'

describe('explorationUtils.getCohortSensitivity', () => {
  it('retourne NOMINAL dès que la lecture nominative est autorisée', () => {
    expect(getCohortSensitivity({ read_patient_nomi: true })).toBe(accessType.NOMINAL)
    expect(getCohortSensitivity({ read_patient_nomi: true, read_patient_pseudo: true })).toBe(accessType.NOMINAL)
    expect(getCohortSensitivity({ read_patient_nomi: true, read_patient_pseudo: false })).toBe(accessType.NOMINAL)
  })

  it('retourne PSEUDO quand seule la lecture pseudonymisée est autorisée', () => {
    expect(getCohortSensitivity({ read_patient_nomi: false, read_patient_pseudo: true })).toBe(accessType.PSEUDO)
    expect(getCohortSensitivity({ read_patient_pseudo: true })).toBe(accessType.PSEUDO)
  })

  it("est basé sur la lecture, pas sur l'export : export nominatif + lecture pseudo => PSEUDO", () => {
    expect(
      getCohortSensitivity({ export_csv_xlsx_nomi: true, read_patient_nomi: false, read_patient_pseudo: true })
    ).toBe(accessType.PSEUDO)
  })

  it('retourne undefined quand les droits sont inconnus ou vides', () => {
    expect(getCohortSensitivity(undefined)).toBeUndefined()
    expect(getCohortSensitivity({})).toBeUndefined()
    expect(getCohortSensitivity({ read_patient_nomi: false, read_patient_pseudo: false })).toBeUndefined()
    // un droit d'export seul ne suffit pas à qualifier la consultation
    expect(getCohortSensitivity({ export_csv_xlsx_nomi: true } as GroupRights)).toBeUndefined()
  })
})
