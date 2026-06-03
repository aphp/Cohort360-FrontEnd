import allDocTypes from 'assets/docTypes.json'

/**
 * Récupère le code parent (chapitre) à partir du type d'un docType
 * @param docTypeCode - Le code du type de document
 * @returns Le code du chapitre parent ou null si non trouvé
 */
export const getParentCodeFromDocType = (docTypeCode: string): string | null => {
  const docType = allDocTypes.docTypes.find((dt) => dt.code === docTypeCode)
  if (!docType) return null

  const chapter = allDocTypes.chapters.find((ch) => ch.display === docType.type)
  return chapter ? chapter.code : null
}

/**
 * À partir d'une liste de codes de docTypes, retourne l'ensemble des codes
 * incluant les codes parents (chapitres) uniques
 * @param docTypeCodes - Liste des codes de types de documents
 * @returns Liste des codes incluant les codes parents uniques
 */
export const addParentCodesToDocTypes = (docTypeCodes: string[]): string[] => {
  const parentCodes = new Set<string>()
  const allCodes = new Set<string>(docTypeCodes)

  docTypeCodes.forEach((code) => {
    const parentCode = getParentCodeFromDocType(code)
    if (parentCode) {
      parentCodes.add(parentCode)
      allCodes.add(parentCode)
    } else {
      // Si le code n'a pas de parent, c'est peut-être déjà un code parent
      allCodes.add(code)
    }
  })

  return Array.from(allCodes)
}

/**
 * Récupère le label d'un type de document à partir de son code
 * Gère à la fois les codes enfants (docTypes) et les codes parents (chapters)
 * @param code - Le code du type de document ou du chapitre
 * @returns Un objet contenant le label et le type (parent ou child) ou null si non trouvé
 */
export const getDocTypeLabel = (code: string): { label: string; isParent: boolean } | null => {
  if (!code) return null

  // Chercher d'abord dans les docTypes (codes enfants)
  const docType = allDocTypes.docTypes.find((dt) => dt.code.toLowerCase() === code.toLowerCase())
  if (docType) {
    return { label: docType.label, isParent: false }
  }

  // Si non trouvé, chercher dans les chapters (codes parents)
  const chapter = allDocTypes.chapters.find((ch) => ch.code.toLowerCase() === code.toLowerCase())
  if (chapter) {
    return { label: chapter.display, isParent: true }
  }

  return null
}
