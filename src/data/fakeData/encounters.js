const encounters = [
  {
    resourceType: 'Encounter',
    id: '12074467126',
    meta: {
      lastUpdated: '2020-12-17T15:47:32.000+01:00'
    },
    extension: [
      {
        url: 'deidentified',
        valueBoolean: false
      },
      {
        url: 'stay',
        valueCodeableConcept: {
          coding: [
            {
              system: 'https://terminology.eds.aphp.fr/aphp-orbis-visit-type',
              code: 'ext',
              display: 'consultation externe'
            }
          ]
        }
      }
    ],
    identifier: [
      {
        type: {
          coding: [
            {
              system: 'https://terminology.eds.aphp.fr/aphp-demographic',
              code: 'NDA',
              display: 'Identifiant Venue'
            }
          ]
        },
        value: '9600124398'
      }
    ],
    status: 'in-progress',
    class: {
      system: 'https://terminology.eds.aphp.fr/aphp-orbis-visit_type',
      code: 'ext',
      display: 'consultation externe'
    },
    type: [
      {
        coding: [
          {
            system: 'https://terminology.eds.aphp.fr/aphp-orbis-visit_detail pmsi',
            code: 'VISIT',
            display: 'Visite hospitaliere'
          }
        ]
      }
    ],
    subject: {
      reference: 'Patient/187063415'
    },
    period: {
      start: '2020-06-30T12:19:00+02:00'
    },
    serviceProvider: {
      reference: 'Organization/8312007309',
      display: 'HOPITAL PAUL BROUSSE'
    }
  },
  {
    resourceType: 'Encounter',
    id: '10759302551',
    meta: {
      lastUpdated: '2020-12-17T15:47:32.000+01:00'
    },
    extension: [
      {
        url: 'deidentified',
        valueBoolean: false
      },
      {
        url: 'stay',
        valueCodeableConcept: {
          coding: [
            {
              system: 'https://terminology.eds.aphp.fr/aphp-orbis-visit_type',
              code: 'ext',
              display: 'consultation externe'
            }
          ]
        }
      }
    ],
    identifier: [
      {
        type: {
          coding: [
            {
              system: 'https://terminology.eds.aphp.fr/aphp-demographic',
              code: 'NDA',
              display: 'Identifiant Venue'
            }
          ]
        },
        value: '1001199468'
      }
    ],
    status: 'in-progress',
    class: {
      system: 'https://terminology.eds.aphp.fr/aphp-orbis-visit_type',
      code: 'ext',
      display: 'consultation externe'
    },
    type: [
      {
        coding: [
          {
            system: 'https://terminology.eds.aphp.fr/aphp-orbis-visit_detail pmsi',
            code: 'VISIT',
            display: 'Visite hospitaliere'
          }
        ]
      }
    ],
    subject: {
      reference: 'Patient/187063415'
    },
    period: {
      start: '2020-04-21T11:21:00+02:00'
    },
    serviceProvider: {
      reference: 'Organization/8312022130',
      display: 'HOPITAL DE BICETRE'
    }
  },
  {
    resourceType: 'Encounter',
    id: '9054582219',
    meta: {
      lastUpdated: '2020-12-17T15:47:32.000+01:00'
    },
    extension: [
      {
        url: 'deidentified',
        valueBoolean: false
      },
      {
        url: 'stay',
        valueCodeableConcept: {
          coding: [
            {
              system: 'https://terminology.eds.aphp.fr/aphp-orbis-visit_type',
              code: 'incomp',
              display: 'hospitalisation incomplète'
            }
          ]
        }
      }
    ],
    identifier: [
      {
        type: {
          coding: [
            {
              system: 'https://terminology.eds.aphp.fr/aphp-demographic',
              code: 'NDA',
              display: 'Identifiant Venue'
            }
          ]
        },
        value: '961565596'
      }
    ],
    status: 'in-progress',
    class: {
      system: 'https://terminology.eds.aphp.fr/aphp-orbis-visit_type',
      code: 'incomp',
      display: 'hospitalisation incomplète'
    },
    type: [
      {
        coding: [
          {
            system: 'https://terminology.eds.aphp.fr/aphp-orbis-visit_detail pmsi',
            code: 'VISIT',
            display: 'Visite hospitaliere'
          }
        ]
      }
    ],
    subject: {
      reference: 'Patient/187063415'
    },
    period: {
      start: '2020-01-17T07:59:00+01:00'
    },
    hospitalization: {
      admitSource: {
        coding: [
          {
            system: 'https://terminology.eds.aphp.fr/aphp-orbis-visit-mode-entree',
            code: '01_294',
            display: '1 - admission directe'
          }
        ]
      }
    },
    serviceProvider: {
      reference: 'Organization/8312007309',
      display: 'HOPITAL PAUL BROUSSE'
    }
  }
]

export default encounters
