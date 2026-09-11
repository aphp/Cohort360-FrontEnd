import { Questionnaire } from 'fhir/r4'
import {
  extractFormItems,
  extractOptions,
  getTransformationType,
  mapToSimpleType,
  MAPPING_EXTENSION_URL
} from 'utils/questionnaireFormData'

const FORM_NAME = 'APHPEDSQuestionnaireFicheHospitalisation'

const mappingExtension = (transformationType: string) => ({
  url: MAPPING_EXTENSION_URL,
  extension: [{ url: 'transformation_type', valueCode: transformationType }]
})

const fixture: Questionnaire = {
  resourceType: 'Questionnaire',
  status: 'active',
  name: FORM_NAME,
  item: [
    {
      extension: [mappingExtension('Group')],
      linkId: 'F_MATER_004050',
      text: 'Observation médicale initiale (Onglet)',
      type: 'group',
      item: [
        {
          extension: [mappingExtension('UniqueChoice')],
          linkId: 'F_MATER_004052',
          text: "Identifiant(s) technique(s) du (des) motif(s) d'hospitalisation",
          type: 'choice',
          answerValueSet: 'https://aphp.fr/ig/fhir/eds/ValueSet/aphp-eds-aph-mat-hos-motifs-hospit-vs'
        },
        {
          extension: [mappingExtension('StringText')],
          linkId: 'F_MATER_004053',
          text: "Précisions (autre motif d'hospitalisation)",
          type: 'text'
        },
        {
          extension: [mappingExtension('ChoiceByBooleans')],
          linkId: 'F_MATER_007005',
          text: 'VME',
          type: 'choice',
          answerOption: [
            { valueCoding: { display: 'Non faite' } },
            { valueCoding: { display: 'Faite' } },
            { valueCoding: { display: 'Réussie' } },
            { valueCoding: { display: 'Non réussie' } }
          ]
        },
        {
          extension: [mappingExtension('Boolean')],
          linkId: 'F_MATER_004062',
          text: 'Grossesse peu ou pas suivie',
          type: 'boolean'
        },
        {
          extension: [mappingExtension('DateTime')],
          linkId: 'F_MATER_004002',
          text: 'Date d’admission',
          type: 'dateTime'
        },
        {
          extension: [mappingExtension('Date')],
          linkId: 'F_MATER_004081',
          text: "Début d'antécédant ou d'allergie",
          type: 'date'
        },
        {
          extension: [mappingExtension('IntegerUnit')],
          linkId: 'F_MATER_004156',
          text: 'Fréquence cardiaque (bpm)',
          type: 'integer'
        },
        {
          extension: [mappingExtension('IntegerUnit')],
          linkId: 'F_MATER_004152',
          text: 'Poids actuel (kg)',
          type: 'decimal'
        },
        {
          extension: [mappingExtension('UserRef')],
          linkId: 'F_MATER_004003',
          text: 'Médecin sénior',
          type: 'reference'
        },
        {
          extension: [mappingExtension('Time')],
          linkId: 'F_MATER_005525',
          text: '(Contaception - liste) Heure',
          type: 'time'
        },
        {
          linkId: 'F_MATER_099001',
          text: 'Champ sans extension APHP',
          type: 'choice',
          answerValueSet: 'https://aphp.fr/ig/fhir/eds/ValueSet/aphp-eds-fallback-vs'
        },
        {
          linkId: 'F_MATER_099010',
          text: 'Groupe sans extension',
          type: 'group',
          item: [
            {
              linkId: 'F_MATER_099011',
              text: 'Enfant de groupe sans extension',
              type: 'boolean'
            }
          ]
        }
      ]
    }
  ]
}

describe('getTransformationType', () => {
  it('lit le transformation_type dans l’extension APHP', () => {
    const item = { linkId: 'x', type: 'choice' as const, extension: [mappingExtension('UniqueChoice')] }
    expect(getTransformationType(item)).toBe('UniqueChoice')
  })
  it('retourne undefined si pas d’extension de mapping', () => {
    expect(getTransformationType({ linkId: 'x', type: 'choice' })).toBeUndefined()
  })
})

describe('mapToSimpleType', () => {
  it('mappe les sous-types choice vers valueCoding', () => {
    expect(mapToSimpleType('UniqueChoice', 'choice')).toBe('valueCoding')
    expect(mapToSimpleType('MultipleChoice', 'choice')).toBe('valueCoding')
    expect(mapToSimpleType('ChoiceByBooleans', 'choice')).toBe('valueCoding')
  })
  it('mappe StringText / Boolean / Date / DateTime', () => {
    expect(mapToSimpleType('StringText', 'text')).toBe('valueString')
    expect(mapToSimpleType('Boolean', 'boolean')).toBe('valueBoolean')
    expect(mapToSimpleType('Date', 'date')).toBe('valueDate')
    expect(mapToSimpleType('DateTime', 'dateTime')).toBe('valueDateTime')
  })
  it('désambiguïse IntegerUnit selon item.type', () => {
    expect(mapToSimpleType('IntegerUnit', 'integer')).toBe('valueInteger')
    expect(mapToSimpleType('IntegerUnit', 'decimal')).toBe('valueDecimal')
  })
  it('retombe sur le type FHIR standard quand l’extension est absente ou non reconnue', () => {
    expect(mapToSimpleType(undefined, 'choice')).toBe('valueCoding')
    expect(mapToSimpleType(undefined, 'text')).toBe('valueString')
    expect(mapToSimpleType(undefined, 'boolean')).toBe('valueBoolean')
    expect(mapToSimpleType(undefined, 'integer')).toBe('valueInteger')
    expect(mapToSimpleType('TypeInconnu', 'date')).toBe('valueDate')
  })
  it('retourne undefined pour les types non exploités (reference, time) et sans type', () => {
    expect(mapToSimpleType('UserRef', 'reference')).toBeUndefined()
    expect(mapToSimpleType('Time', 'time')).toBeUndefined()
    expect(mapToSimpleType(undefined, 'reference')).toBeUndefined()
    expect(mapToSimpleType(undefined, undefined)).toBeUndefined()
  })
})

describe('extractOptions', () => {
  it('dérive les options des answerOption inline (id = label)', () => {
    const options = extractOptions({
      linkId: 'x',
      type: 'choice',
      answerOption: [{ valueCoding: { display: 'Oui' } }, { valueCoding: { display: 'Non' } }]
    })
    expect(options).toEqual([
      { id: 'Oui', label: 'Oui' },
      { id: 'Non', label: 'Non' }
    ])
  })
  it('retourne undefined sans answerOption', () => {
    expect(extractOptions({ linkId: 'x', type: 'choice' })).toBeUndefined()
  })
})

describe('extractFormItems', () => {
  const items = extractFormItems(fixture, FORM_NAME)
  const byLinkId = (linkId: string) => items.find((item) => item.linkId === linkId)

  it('ignore les conteneurs, références et temps', () => {
    expect(byLinkId('F_MATER_004050')).toBeUndefined()
    expect(byLinkId('F_MATER_004003')).toBeUndefined()
    expect(byLinkId('F_MATER_005525')).toBeUndefined()
  })

  it('construit un id combinant formName et linkId', () => {
    expect(byLinkId('F_MATER_004052')?.id).toBe(`${FORM_NAME}-F_MATER_004052`)
  })

  it('extrait un UniqueChoice avec valueSet et sans options', () => {
    const item = byLinkId('F_MATER_004052')
    expect(item?.itemType).toBe('valueCoding')
    expect(item?.valueSet).toBe('https://aphp.fr/ig/fhir/eds/ValueSet/aphp-eds-aph-mat-hos-motifs-hospit-vs')
    expect(item?.options).toBeUndefined()
  })

  it('extrait un ChoiceByBooleans avec options inline et sans valueSet', () => {
    const item = byLinkId('F_MATER_007005')
    expect(item?.itemType).toBe('valueCoding')
    expect(item?.valueSet).toBeUndefined()
    expect(item?.options).toEqual([
      { id: 'Non faite', label: 'Non faite' },
      { id: 'Faite', label: 'Faite' },
      { id: 'Réussie', label: 'Réussie' },
      { id: 'Non réussie', label: 'Non réussie' }
    ])
  })

  it('mappe les types simples (string, boolean, date, dateTime)', () => {
    expect(byLinkId('F_MATER_004053')?.itemType).toBe('valueString')
    expect(byLinkId('F_MATER_004062')?.itemType).toBe('valueBoolean')
    expect(byLinkId('F_MATER_004081')?.itemType).toBe('valueDate')
    expect(byLinkId('F_MATER_004002')?.itemType).toBe('valueDateTime')
  })

  it('fournit des options Oui/Non par défaut pour un champ booléen', () => {
    expect(byLinkId('F_MATER_004062')?.options).toEqual([
      { id: 'true', label: 'Oui' },
      { id: 'false', label: 'Non' }
    ])
  })

  it('désambiguïse IntegerUnit en integer ou decimal selon item.type', () => {
    expect(byLinkId('F_MATER_004156')?.itemType).toBe('valueInteger')
    expect(byLinkId('F_MATER_004152')?.itemType).toBe('valueDecimal')
  })

  it('retombe sur le type FHIR standard quand l’extension transformation_type est absente', () => {
    const item = byLinkId('F_MATER_099001')
    expect(item?.itemType).toBe('valueCoding')
    expect(item?.valueSet).toBe('https://aphp.fr/ig/fhir/eds/ValueSet/aphp-eds-fallback-vs')
  })

  it('traite un group sans extension comme conteneur et descend dans ses enfants', () => {
    expect(byLinkId('F_MATER_099010')).toBeUndefined()
    expect(byLinkId('F_MATER_099011')?.itemType).toBe('valueBoolean')
  })

  it('renseigne le titre depuis item.text', () => {
    expect(byLinkId('F_MATER_007005')?.title).toBe('VME')
  })
})
