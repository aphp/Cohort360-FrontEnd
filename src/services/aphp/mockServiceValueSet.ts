import { Back_API_Response } from 'types'
import { FhirHierarchy, Hierarchy, HierarchyWithLabel } from 'types/hierarchy'

const nodes = [
  {
    id: '1',
    label: 'Aspirin',
    system: 'https://terminology.eds.aphp.fr/atc',
    above_levels_ids: '*',
    inferior_levels_ids: '11,12'
  },
  {
    id: '2',
    label: 'Ibuprofen',
    system: 'https://terminology.eds.aphp.fr/atc',
    above_levels_ids: '*',
    inferior_levels_ids: '13,14'
  },
  {
    id: '3',
    label: 'Paracetamol',
    system: 'https://terminology.eds.aphp.fr/atc',
    above_levels_ids: '*',
    inferior_levels_ids: '15,16'
  },
  {
    id: '4',
    label: 'Metformin',
    system: 'https://terminology.eds.aphp.fr/atc',
    above_levels_ids: '*',
    inferior_levels_ids: '17,18'
  },
  {
    id: '5',
    label: 'Lisinopril',
    system: 'https://terminology.eds.aphp.fr/atc',
    above_levels_ids: '*',
    inferior_levels_ids: '19,20'
  },
  {
    id: '6',
    label: 'Simvastatin',
    system: 'https://terminology.eds.aphp.fr/atc',
    above_levels_ids: '*',
    inferior_levels_ids: '21,22'
  },
  {
    id: '7',
    label: 'Amoxicillin',
    system: 'https://terminology.eds.aphp.fr/atc',
    above_levels_ids: '*',
    inferior_levels_ids: '23,24'
  },
  {
    id: '8',
    label: 'Azithromycin',
    system: 'https://terminology.eds.aphp.fr/atc',
    above_levels_ids: '*',
    inferior_levels_ids: '25,26'
  },
  {
    id: '9',
    label: 'Omeprazole',
    system: 'https://terminology.eds.aphp.fr/atc',
    above_levels_ids: '*',
    inferior_levels_ids: '27,28'
  },
  {
    id: '10',
    label: 'Hydrochlorothiazide',
    system: 'https://terminology.eds.aphp.fr/atc',
    above_levels_ids: '*',
    inferior_levels_ids: '29,30'
  },
  {
    id: '11',
    label: 'Aspirin 500mg',
    system: 'https://terminology.eds.aphp.fr/atc',
    above_levels_ids: '1',
    inferior_levels_ids: ''
  },
  {
    id: '12',
    label: 'Aspirin 100mg',
    system: 'https://terminology.eds.aphp.fr/atc',
    above_levels_ids: '1',
    inferior_levels_ids: ''
  },
  {
    id: '13',
    label: 'Ibuprofen 200mg',
    system: 'https://terminology.eds.aphp.fr/atc',
    above_levels_ids: '2',
    inferior_levels_ids: ''
  },
  {
    id: '14',
    label: 'Ibuprofen 400mg',
    system: 'https://terminology.eds.aphp.fr/atc',
    above_levels_ids: '2',
    inferior_levels_ids: ''
  },
  {
    id: '15',
    label: 'Paracetamol 500mg',
    system: 'https://terminology.eds.aphp.fr/atc',
    above_levels_ids: '3',
    inferior_levels_ids: ''
  },
  {
    id: '16',
    label: 'Paracetamol 1000mg',
    system: 'https://terminology.eds.aphp.fr/atc',
    above_levels_ids: '3',
    inferior_levels_ids: ''
  },
  {
    id: '17',
    label: 'Metformin 500mg',
    system: 'https://terminology.eds.aphp.fr/atc',
    above_levels_ids: '4',
    inferior_levels_ids: ''
  },
  {
    id: '18',
    label: 'Metformin 1000mg',
    system: 'https://terminology.eds.aphp.fr/atc',
    above_levels_ids: '4',
    inferior_levels_ids: ''
  },
  {
    id: '19',
    label: 'Lisinopril 10mg',
    system: 'https://terminology.eds.aphp.fr/atc',
    above_levels_ids: '5',
    inferior_levels_ids: ''
  },
  {
    id: '20',
    label: 'Lisinopril 20mg',
    system: 'https://terminology.eds.aphp.fr/atc',
    above_levels_ids: '5',
    inferior_levels_ids: ''
  },
  {
    id: '21',
    label: 'Simvastatin 10mg',
    system: 'https://terminology.eds.aphp.fr/atc',
    above_levels_ids: '6',
    inferior_levels_ids: ''
  },
  {
    id: '22',
    label: 'Simvastatin 20mg',
    system: 'https://terminology.eds.aphp.fr/atc',
    above_levels_ids: '6',
    inferior_levels_ids: ''
  },
  {
    id: '23',
    label: 'Amoxicillin 500mg',
    system: 'https://terminology.eds.aphp.fr/atc',
    above_levels_ids: '7',
    inferior_levels_ids: ''
  },
  {
    id: '24',
    label: 'Amoxicillin 1000mg',
    system: 'https://terminology.eds.aphp.fr/atc',
    above_levels_ids: '7',
    inferior_levels_ids: ''
  },
  {
    id: '25',
    label: 'Azithromycin 250mg',
    system: 'https://terminology.eds.aphp.fr/atc',
    above_levels_ids: '8',
    inferior_levels_ids: ''
  },
  {
    id: '26',
    label: 'Azithromycin 500mg',
    system: 'https://terminology.eds.aphp.fr/atc',
    above_levels_ids: '8',
    inferior_levels_ids: ''
  },
  {
    id: '27',
    label: 'Omeprazole 20mg',
    system: 'https://terminology.eds.aphp.fr/atc',
    above_levels_ids: '9',
    inferior_levels_ids: ''
  },
  {
    id: '28',
    label: 'Omeprazole 40mg',
    system: 'https://terminology.eds.aphp.fr/atc',
    above_levels_ids: '9',
    inferior_levels_ids: ''
  },
  {
    id: '29',
    label: 'Hydrochlorothiazide 12.5mg',
    system: 'https://terminology.eds.aphp.fr/atc',
    above_levels_ids: '10',
    inferior_levels_ids: ''
  },
  {
    id: '30',
    label: 'Hydrochlorothiazide 25mg',
    system: 'https://terminology.eds.aphp.fr/atc',
    above_levels_ids: '10',
    inferior_levels_ids: ''
  },
  {
    id: '31',
    label: 'Ciprofloxacin',
    system: 'https://terminology.eds.aphp.fr/smt-medicament-ucd',
    above_levels_ids: '*',
    inferior_levels_ids: '41,42'
  },
  {
    id: '32',
    label: 'Loratadine',
    system: 'https://terminology.eds.aphp.fr/smt-medicament-ucd',
    above_levels_ids: '*',
    inferior_levels_ids: '43,44'
  },
  {
    id: '33',
    label: 'Omeprazole',
    system: 'https://terminology.eds.aphp.fr/smt-medicament-ucd',
    above_levels_ids: '*',
    inferior_levels_ids: '45,46'
  },
  {
    id: '34',
    label: 'Metformin',
    system: 'https://terminology.eds.aphp.fr/smt-medicament-ucd',
    above_levels_ids: '*',
    inferior_levels_ids: '47,48'
  },
  {
    id: '35',
    label: 'Simvastatin',
    system: 'https://terminology.eds.aphp.fr/smt-medicament-ucd',
    above_levels_ids: '*',
    inferior_levels_ids: '49,50'
  },
  {
    id: '36',
    label: 'Amlodipine',
    system: 'https://terminology.eds.aphp.fr/smt-medicament-ucd',
    above_levels_ids: '*',
    inferior_levels_ids: '51,52'
  },
  {
    id: '37',
    label: 'Ibuprofen',
    system: 'https://terminology.eds.aphp.fr/smt-medicament-ucd',
    above_levels_ids: '*',
    inferior_levels_ids: '53,54'
  },
  {
    id: '38',
    label: 'Paracetamol',
    system: 'https://terminology.eds.aphp.fr/smt-medicament-ucd',
    above_levels_ids: '*',
    inferior_levels_ids: '55,56'
  },
  {
    id: '39',
    label: 'Candesartan',
    system: 'https://terminology.eds.aphp.fr/smt-medicament-ucd',
    above_levels_ids: '*',
    inferior_levels_ids: '57,58'
  },
  {
    id: '40',
    label: 'Clopidogrel',
    system: 'https://terminology.eds.aphp.fr/smt-medicament-ucd',
    above_levels_ids: '*',
    inferior_levels_ids: '59,60'
  },
  {
    id: '41',
    label: 'Ciprofloxacin 500mg',
    system: 'https://terminology.eds.aphp.fr/smt-medicament-ucd',
    above_levels_ids: '31',
    inferior_levels_ids: ''
  },
  {
    id: '42',
    label: 'Ciprofloxacin 750mg',
    system: 'https://terminology.eds.aphp.fr/smt-medicament-ucd',
    above_levels_ids: '31',
    inferior_levels_ids: ''
  },
  {
    id: '43',
    label: 'Loratadine 10mg',
    system: 'https://terminology.eds.aphp.fr/smt-medicament-ucd',
    above_levels_ids: '32',
    inferior_levels_ids: ''
  },
  {
    id: '44',
    label: 'Loratadine 5mg',
    system: 'https://terminology.eds.aphp.fr/smt-medicament-ucd',
    above_levels_ids: '32',
    inferior_levels_ids: ''
  },
  {
    id: '45',
    label: 'Omeprazole 20mg',
    system: 'https://terminology.eds.aphp.fr/smt-medicament-ucd',
    above_levels_ids: '33',
    inferior_levels_ids: ''
  },
  {
    id: '46',
    label: 'Omeprazole 40mg',
    system: 'https://terminology.eds.aphp.fr/smt-medicament-ucd',
    above_levels_ids: '33',
    inferior_levels_ids: ''
  },
  {
    id: '47',
    label: 'Metformin 500mg',
    system: 'https://terminology.eds.aphp.fr/smt-medicament-ucd',
    above_levels_ids: '34',
    inferior_levels_ids: ''
  },
  {
    id: '48',
    label: 'Metformin 1000mg',
    system: 'https://terminology.eds.aphp.fr/smt-medicament-ucd',
    above_levels_ids: '34',
    inferior_levels_ids: ''
  },
  {
    id: '49',
    label: 'Simvastatin 10mg',
    system: 'https://terminology.eds.aphp.fr/smt-medicament-ucd',
    above_levels_ids: '35',
    inferior_levels_ids: ''
  },
  {
    id: '50',
    label: 'Simvastatin 20mg',
    system: 'https://terminology.eds.aphp.fr/smt-medicament-ucd',
    above_levels_ids: '35',
    inferior_levels_ids: ''
  },
  {
    id: '51',
    label: 'Amlodipine 5mg',
    system: 'https://terminology.eds.aphp.fr/smt-medicament-ucd',
    above_levels_ids: '36',
    inferior_levels_ids: ''
  },
  {
    id: '52',
    label: 'Amlodipine 10mg',
    system: 'https://terminology.eds.aphp.fr/smt-medicament-ucd',
    above_levels_ids: '36',
    inferior_levels_ids: ''
  },
  {
    id: '53',
    label: 'Ibuprofen 200mg',
    system: 'https://terminology.eds.aphp.fr/smt-medicament-ucd',
    above_levels_ids: '37',
    inferior_levels_ids: ''
  },
  {
    id: '54',
    label: 'Ibuprofen 400mg',
    system: 'https://terminology.eds.aphp.fr/smt-medicament-ucd',
    above_levels_ids: '37',
    inferior_levels_ids: ''
  },
  {
    id: '55',
    label: 'Paracetamol 500mg',
    system: 'https://terminology.eds.aphp.fr/smt-medicament-ucd',
    above_levels_ids: '38',
    inferior_levels_ids: ''
  },
  {
    id: '56',
    label: 'Paracetamol 1000mg',
    system: 'https://terminology.eds.aphp.fr/smt-medicament-ucd',
    above_levels_ids: '38',
    inferior_levels_ids: ''
  },
  {
    id: '57',
    label: 'Candesartan 4mg',
    system: 'https://terminology.eds.aphp.fr/smt-medicament-ucd',
    above_levels_ids: '39',
    inferior_levels_ids: ''
  },
  {
    id: '58',
    label: 'Candesartan 8mg',
    system: 'https://terminology.eds.aphp.fr/smt-medicament-ucd',
    above_levels_ids: '39',
    inferior_levels_ids: ''
  },
  {
    id: '59',
    label: 'Clopidogrel 75mg',
    system: 'https://terminology.eds.aphp.fr/smt-medicament-ucd',
    above_levels_ids: '40',
    inferior_levels_ids: ''
  }
]

export const getHierarchyRoots = (
  codeSystem: string,
  valueSetTitle: string,
  joinDisplayWithCode = true,
  filterRoots: (code: HierarchyWithLabel) => boolean = () => true,
  filterOut: (code: HierarchyWithLabel) => boolean = (value: HierarchyWithLabel) => value.id === 'APHP generated',
  signal?: AbortSignal
) => {
  if (codeSystem === 'https://terminology.eds.aphp.fr/atc')
    return {
      count: 1,
      results: [
        {
          id: '*',
          label: 'Node ATC',
          system: 'https://terminology.eds.aphp.fr/atc',
          above_levels_ids: '',
          inferior_levels_ids: '1,2,3,4,5,6,7,8,9,10'
        }
      ]
    }
  return {
    count: 1,
    results: [
      {
        id: '*',
        label: 'Node UCD',
        system: 'https://terminology.eds.aphp.fr/smt-medicament-ucd',
        above_levels_ids: '',
        inferior_levels_ids: '31,32,33,34,35,36,37,38,39,40'
      }
    ]
  }
}

export const getChildrenFromCodes = async (
  codeSystem: string,
  codes: string[],
  signal?: AbortSignal
): Promise<Back_API_Response<Hierarchy<FhirHierarchy, string>>> => {
  const filtered = nodes.filter((node) => node.system === codeSystem && codes.includes(node.id))
  return { results: filtered, count: filtered.length }
}

export const searchCodes = async (
  codeSystems: string[],
  search: string,
  offset: number,
  count: number,
  signal?: AbortSignal
): Promise<Back_API_Response<Hierarchy<FhirHierarchy, string>>> => {
  let filtered = []
  if (search)
    filtered = nodes.filter(
      (node) => codeSystems.includes(node.system) && node.label.toLowerCase().includes(search.toLowerCase())
    )
  else filtered = nodes.filter((node) => codeSystems.includes(node.system))
  return { results: filtered, count: filtered.length }
}
