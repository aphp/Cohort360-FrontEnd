const claims = [
  {
    resourceType: 'Claim',
    id: '6539145420',
    meta: {
      lastUpdated: '2020-12-10T15:09:29.000+01:00'
    },
    type: {
      coding: [
        {
          system: 'OMOP generated/none',
          code: 'No matching concept',
          display: 'No matching concept'
        }
      ]
    },
    created: '2020-11-23T00:00:00+01:00',
    diagnosis: [
      {
        packageCode: {
          coding: [
            {
              system: 'https://terminology.eds.aphp.fr/aphp-orbis-ghm',
              code: '10M162',
              display: 'Troubles métaboliques, âge supérieur à 17 ans, niveau 2'
            }
          ]
        }
      }
    ],
    serviceProvider: 'Narnia',
    NDA: '20000000'
  },
  {
    resourceType: 'Claim',
    id: '6539145421',
    meta: {
      lastUpdated: '2020-12-10T15:09:29.000+01:00'
    },
    type: {
      coding: [
        {
          system: 'OMOP generated/none',
          code: 'No matching concept',
          display: 'No matching concept'
        }
      ]
    },
    created: '2020-11-23T00:00:00+01:00',
    diagnosis: [
      {
        packageCode: {
          coding: [
            {
              system: 'https://terminology.eds.aphp.fr/aphp-orbis-ghm',
              code: '10M162',
              display: 'Troubles métaboliques, âge supérieur à 17 ans, niveau 2'
            }
          ]
        }
      }
    ],
    serviceProvider: 'Narnia',
    NDA: '20000000'
  },
  {
    resourceType: 'Claim',
    id: '6357577133',
    meta: {
      lastUpdated: '2020-12-10T15:09:29.000+01:00'
    },
    type: {
      coding: [
        {
          system: 'OMOP generated/none',
          code: 'No matching concept',
          display: 'No matching concept'
        }
      ]
    },
    created: '2020-06-08T00:00:00+02:00',
    diagnosis: [
      {
        packageCode: {
          coding: [
            {
              system: 'https://terminology.eds.aphp.fr/aphp-orbis-ghm',
              code: '11M19Z',
              display: 'Autres symptômes et recours aux soins de la CMD 11'
            }
          ]
        }
      }
    ],
    serviceProvider: 'Narnia',
    NDA: '20000000'
  }
]

export default claims
