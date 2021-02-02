const patients = [
  {
    resourceType: 'Patient',
    id: '1',
    meta: {
      lastUpdated: '2020-12-21T14:39:07.000+01:00',
      tag: [
        {
          system: 'http://terminology.hl7.org/CodeSystem/v3-ObservationValue',
          code: 'SUBSETTED',
          display: 'Resource encoded in summary mode'
        }
      ]
    },
    lastEncounterName: 'Narnia',
    extension: [
      {
        url: 'deidentified',
        valueBoolean: false
      },
      {
        url: 'Age(Years)',
        valueString: '80.0'
      }
    ],
    identifier: [
      {
        type: {
          coding: [
            {
              system: 'https://terminology.eds.aphp.fr/aphp-demographic',
              code: 'IPP',
              display: 'Identifiant Patient'
            }
          ]
        },
        value: '800000000'
      },
      {
        type: {
          coding: [
            {
              system: 'https://terminology.eds.aphp.fr/aphp-demographic',
              code: 'SECU',
              display: 'Numero de Securite sociale'
            }
          ]
        },
        value: '12324243'
      }
    ],
    name: [
      {
        family: 'Nom',
        given: ['Prénom']
      }
    ],
    gender: 'male',
    birthDate: '1941-01-16',
    deceasedBoolean: false
  },
  {
    resourceType: 'Patient',
    id: '2',
    meta: {
      lastUpdated: '2020-12-21T14:39:07.000+01:00',
      tag: [
        {
          system: 'http://terminology.hl7.org/CodeSystem/v3-ObservationValue',
          code: 'SUBSETTED',
          display: 'Resource encoded in summary mode'
        }
      ]
    },
    lastEncounterName: 'Narnia',
    extension: [
      {
        url: 'deidentified',
        valueBoolean: false
      },
      {
        url: 'Age(Years)',
        valueString: '80.0'
      }
    ],
    identifier: [
      {
        type: {
          coding: [
            {
              system: 'https://terminology.eds.aphp.fr/aphp-demographic',
              code: 'IPP',
              display: 'Identifiant Patient'
            }
          ]
        },
        value: '800000000'
      },
      {
        type: {
          coding: [
            {
              system: 'https://terminology.eds.aphp.fr/aphp-demographic',
              code: 'SECU',
              display: 'Numero de Securite sociale'
            }
          ]
        },
        value: '12324243'
      }
    ],
    name: [
      {
        family: 'Nom',
        given: ['Prénom']
      }
    ],
    gender: 'male',
    birthDate: '1941-01-16',
    deceasedBoolean: false
  },
  {
    resourceType: 'Patient',
    id: '3',
    meta: {
      lastUpdated: '2020-12-21T14:39:07.000+01:00',
      tag: [
        {
          system: 'http://terminology.hl7.org/CodeSystem/v3-ObservationValue',
          code: 'SUBSETTED',
          display: 'Resource encoded in summary mode'
        }
      ]
    },
    lastEncounterName: 'Narnia',
    extension: [
      {
        url: 'deidentified',
        valueBoolean: false
      },
      {
        url: 'Age(Years)',
        valueString: '80.0'
      }
    ],
    identifier: [
      {
        type: {
          coding: [
            {
              system: 'https://terminology.eds.aphp.fr/aphp-demographic',
              code: 'IPP',
              display: 'Identifiant Patient'
            }
          ]
        },
        value: '800000000'
      },
      {
        type: {
          coding: [
            {
              system: 'https://terminology.eds.aphp.fr/aphp-demographic',
              code: 'SECU',
              display: 'Numero de Securite sociale'
            }
          ]
        },
        value: '12324243'
      }
    ],
    name: [
      {
        family: 'Nom',
        given: ['Prénom']
      }
    ],
    gender: 'male',
    birthDate: '1941-01-16',
    deceasedBoolean: false
  }
]

export default patients
