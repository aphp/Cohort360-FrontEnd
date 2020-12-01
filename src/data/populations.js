const data = [
  {
    name: 'AP-HP. Centre - Université de Paris',
    patientsNb: 12000,
    id: '1',
    parent: null,
    type: 'group'
  },
  {
    name: 'AP-HP. Nord - Université de Paris',
    patientsNb: 12000,
    id: '2',
    parent: null,
    type: 'group'
  },
  {
    name: 'Hôpital Louis Mourier',
    patientsNb: 12000,
    id: '3',
    parent: '2',
    type: 'hospital'
  },
  {
    name: 'Hôpital Beaujon',
    patientsNb: 12000,
    id: '4',
    parent: '2',
    type: 'hospital'
  },

  {
    name: 'Hôpital Bichat Claude Bernard',
    patientsNb: 12000,
    id: '5',
    parent: '2',
    type: 'hospital'
  },
  {
    name: 'DMU - Agents infectieux et hygiène hospitalière',
    patientsNb: 12000,
    id: '6',
    parent: '5',
    type: 'service'
  },
  {
    name: 'DMU - Anatomo-Pathologie',
    patientsNb: 12000,
    id: '7',
    parent: '5',
    type: 'service'
  },
  {
    name: 'DMU - Anesthésie réanimation et surveillance continue médico-chirurgicale',
    patientsNb: 12000,
    id: '8',
    parent: '5',
    type: 'service'
  },
  {
    name: 'DMU - Cardiologie',
    patientsNb: 12000,
    id: '9',
    parent: '5',
    type: 'service'
  },
  {
    name: 'UFR - Cardiologie Bichat 1',
    patientsNb: 12000,
    id: '10',
    parent: '9',
    type: 'unit'
  },
  {
    name: 'UFR - Cardiologie Bichat 2',
    patientsNb: 12000,
    id: '11',
    parent: '9',
    type: 'unit'
  }
]

export default data
