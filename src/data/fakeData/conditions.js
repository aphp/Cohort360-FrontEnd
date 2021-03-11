const conditions = [
  {
    resourceType: 'Condition',
    id: '9331509661',
    meta: {
      lastUpdated: '2020-12-10T15:09:29.000+01:00'
    },
    extension: [
      {
        url: 'https://terminology.eds.aphp.fr/aphp-orbis-condition_status',
        valueString: 'das'
      }
    ],
    verificationStatus: {
      coding: [
        {
          system: 'https://terminology.eds.aphp.fr/aphp-orbis-diagnostic-status',
          code: 'Actif',
          display: 'Actif'
        },
        {
          system: 'http://hl7.org/fhir/CodeSystem/condition-ver-status',
          code: 'confirmed',
          display: 'Confirmed'
        }
      ]
    },
    code: {
      coding: [
        {
          system: 'https://terminology.eds.aphp.fr/aphp-cim10',
          code: 'D638',
          display: "Anémie au cours d'autres maladies chroniques classées ailleurs"
        }
      ]
    },
    subject: {
      reference: 'Patient/1'
    },
    encounter: {
      reference: 'Encounter/1'
    },
    recordedDate: '2020-01-17T07:59:00+01:00',
    serviceProvider: 'Narnia',
    NDA: '20000000'
  },
  {
    resourceType: 'Condition',
    id: '9331509662',
    meta: {
      lastUpdated: '2020-12-10T15:09:29.000+01:00'
    },
    extension: [
      {
        url: 'https://terminology.eds.aphp.fr/aphp-orbis-condition_status',
        valueString: 'das'
      }
    ],
    verificationStatus: {
      coding: [
        {
          system: 'https://terminology.eds.aphp.fr/aphp-orbis-diagnostic-status',
          code: 'Actif',
          display: 'Actif'
        },
        {
          system: 'http://hl7.org/fhir/CodeSystem/condition-ver-status',
          code: 'confirmed',
          display: 'Confirmed'
        }
      ]
    },
    code: {
      coding: [
        {
          system: 'https://terminology.eds.aphp.fr/aphp-cim10',
          code: 'R392',
          display: 'Urémie extrarénale'
        }
      ]
    },
    subject: {
      reference: 'Patient/1'
    },
    encounter: {
      reference: 'Encounter/1'
    },
    recordedDate: '2020-01-17T07:59:00+01:00',
    serviceProvider: 'Narnia',
    NDA: '20000000'
  },
  {
    resourceType: 'Condition',
    id: '9331525890',
    meta: {
      lastUpdated: '2020-12-10T15:09:29.000+01:00'
    },
    extension: [
      {
        url: 'https://terminology.eds.aphp.fr/aphp-orbis-condition_status',
        valueString: 'das'
      }
    ],
    verificationStatus: {
      coding: [
        {
          system: 'https://terminology.eds.aphp.fr/aphp-orbis-diagnostic-status',
          code: 'Actif',
          display: 'Actif'
        },
        {
          system: 'http://hl7.org/fhir/CodeSystem/condition-ver-status',
          code: 'confirmed',
          display: 'Confirmed'
        }
      ]
    },
    code: {
      coding: [
        {
          system: 'https://terminology.eds.aphp.fr/aphp-cim10',
          code: 'Z944',
          display: 'Greffe de foie'
        }
      ]
    },
    subject: {
      reference: 'Patient/1'
    },
    encounter: {
      reference: 'Encounter/1'
    },
    recordedDate: '2020-01-17T07:59:00+01:00',
    serviceProvider: 'Narnia',
    NDA: '20000000'
  }
]

export default conditions
