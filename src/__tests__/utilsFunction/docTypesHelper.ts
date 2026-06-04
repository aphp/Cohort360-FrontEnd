import { addParentCodesToDocTypes, getParentCodeFromDocType } from 'utils/docTypesHelper'

describe('docTypesHelper', () => {
  describe('getParentCodeFromDocType', () => {
    it('devrait retourner le code parent pour LT-AUTR', () => {
      expect(getParentCodeFromDocType('LT-AUTR')).toBe('LT')
    })

    it('devrait retourner le code parent pour LT-TRANSF', () => {
      expect(getParentCodeFromDocType('LT-TRANSF')).toBe('LT')
    })

    it('devrait retourner le code parent pour CR-BILFONC', () => {
      expect(getParentCodeFromDocType('CR-BILFONC')).toBe('CR-AUTRE')
    })

    it('devrait retourner null pour un code inexistant', () => {
      expect(getParentCodeFromDocType('CODE-INEXISTANT')).toBeNull()
    })
  })

  describe('addParentCodesToDocTypes', () => {
    it('devrait ajouter LT aux codes LT-AUTR et LT-TRANSF', () => {
      const result = addParentCodesToDocTypes(['LT-AUTR', 'LT-TRANSF'])
      expect(result).toContain('LT')
      expect(result).toContain('LT-AUTR')
      expect(result).toContain('LT-TRANSF')
      expect(result).toHaveLength(3)
    })

    it('ne devrait pas dupliquer les codes parents', () => {
      const result = addParentCodesToDocTypes(['LT-AUTR', 'LT-TRANSF', 'LT-SOR'])
      expect(result.filter((code) => code === 'LT')).toHaveLength(1)
    })

    it('devrait gérer plusieurs groupes de parents', () => {
      const result = addParentCodesToDocTypes(['LT-AUTR', 'CR-BILFONC'])
      expect(result).toContain('LT')
      expect(result).toContain('CR-AUTRE')
      expect(result).toContain('LT-AUTR')
      expect(result).toContain('CR-BILFONC')
    })
  })
})
