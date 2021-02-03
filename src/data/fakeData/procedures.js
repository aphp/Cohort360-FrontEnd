const procedures = [
  {
    resourceType: 'Procedure',
    id: '9263970006',
    meta: {
      lastUpdated: '2020-12-10T15:09:29.000+01:00'
    },
    status: 'completed',
    code: {
      coding: [
        {
          system: 'https://terminology.eds.aphp.fr/aphp-orbis-ccam',
          code: 'ZZQX069',
          display:
            'Examen immunocytochimique ou immunohistochimique de prélèvement cellulaire ou tissulaire fixé avec 1 à 2 anticorps, sans quantification du signal'
        }
      ]
    },
    performedDateTime: '2020-01-17T00:00:00+01:00',
    serviceProvider: 'Narnia',
    NDA: '20000000'
  },
  {
    resourceType: 'Procedure',
    id: '9066131591',
    meta: {
      lastUpdated: '2020-12-10T15:09:29.000+01:00'
    },
    status: 'completed',
    code: {
      coding: [
        {
          system: 'https://terminology.eds.aphp.fr/aphp-orbis-ccam',
          code: 'HLHJ003',
          display: 'Biopsie non ciblée du foie, par voie transcutanée avec guidage échographique'
        }
      ]
    },
    performedDateTime: '2020-01-17T00:00:00+01:00',
    serviceProvider: 'Narnia',
    NDA: '20000000'
  },
  {
    resourceType: 'Procedure',
    id: '9263970007',
    meta: {
      lastUpdated: '2020-12-10T15:09:29.000+01:00'
    },
    status: 'completed',
    code: {
      coding: [
        {
          system: 'https://terminology.eds.aphp.fr/aphp-orbis-ccam',
          code: 'HLQX013',
          display:
            "Examen histopathologique de biopsie de foie avec coloration spéciale pour diagnostic d'affection non carcinologique"
        }
      ]
    },
    performedDateTime: '2020-01-17T00:00:00+01:00',
    serviceProvider: 'Narnia',
    NDA: '20000000'
  }
]

export default procedures
