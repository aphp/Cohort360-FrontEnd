import { describe, it, expect } from 'vitest'
import { getParentCodeFromDocType, addParentCodesToDocTypes, getDocTypeLabel } from 'utils/docTypesHelper'
import allDocTypes from 'assets/docTypes.json'

// On s'appuie sur des entrées réelles du référentiel docTypes.json pour éviter
// des assertions fragiles: on récupère dynamiquement un couple docType/chapitre valide.
const sampleDocType = allDocTypes.docTypes[0]
const sampleChapter = allDocTypes.chapters.find((ch) => ch.display === sampleDocType.type)!

describe('docTypesHelper.getParentCodeFromDocType', () => {
  it('retourne le code du chapitre parent pour un docType connu', () => {
    expect(getParentCodeFromDocType(sampleDocType.code)).toBe(sampleChapter.code)
  })

  it('retourne null pour un code inconnu', () => {
    expect(getParentCodeFromDocType('CODE_INEXISTANT')).toBeNull()
  })
})

describe('docTypesHelper.addParentCodesToDocTypes', () => {
  it('ajoute le code parent unique aux codes fournis', () => {
    const result = addParentCodesToDocTypes([sampleDocType.code])
    expect(result).toContain(sampleDocType.code)
    expect(result).toContain(sampleChapter.code)
  })

  it('conserve les codes sans parent tels quels (déjà parents)', () => {
    const result = addParentCodesToDocTypes(['CODE_SANS_PARENT'])
    expect(result).toEqual(['CODE_SANS_PARENT'])
  })

  it('déduplique les codes parents', () => {
    // deux docTypes du même chapitre ne doivent pas dupliquer le code parent
    const sameChapterDocTypes = allDocTypes.docTypes.filter((dt) => dt.type === sampleDocType.type).slice(0, 2)
    const codes = sameChapterDocTypes.map((dt) => dt.code)
    const result = addParentCodesToDocTypes(codes)
    const occurrences = result.filter((c) => c === sampleChapter.code).length
    expect(occurrences).toBe(1)
  })

  it('retourne un tableau vide pour une entrée vide', () => {
    expect(addParentCodesToDocTypes([])).toEqual([])
  })
})

describe('docTypesHelper.getDocTypeLabel', () => {
  it('retourne le label d’un docType (enfant) de façon insensible à la casse', () => {
    const result = getDocTypeLabel(sampleDocType.code.toLowerCase())
    expect(result).toEqual({ label: sampleDocType.label, isParent: false })
  })

  it('retourne le display d’un chapitre (parent)', () => {
    const result = getDocTypeLabel(sampleChapter.code)
    expect(result).toEqual({ label: sampleChapter.display, isParent: true })
  })

  it('retourne null pour un code vide ou inconnu', () => {
    expect(getDocTypeLabel('')).toBeNull()
    expect(getDocTypeLabel('CODE_INEXISTANT')).toBeNull()
  })
})
