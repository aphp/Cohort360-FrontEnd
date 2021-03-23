const documents = [
  {
    resourceType: 'Composition',
    id: '12385411148',
    meta: {
      lastUpdated: '2020-12-10T15:09:29.000+01:00',
      tag: [
        {
          system: 'http://terminology.hl7.org/CodeSystem/v3-ObservationValue',
          code: 'SUBSETTED',
          display: 'Resource encoded in summary mode'
        }
      ]
    },
    status: 'final',
    type: {
      coding: [
        {
          system: 'https://terminology.eds.aphp.fr/aphp-orbis-document_textuel hospitalier',
          code: 'crh-chir',
          display: 'CRH Chirurgie'
        }
      ]
    },
    date: '2020-09-09T16:07:06+02:00',
    title: 'CRH Chir. BCT ORL',
    deidentified: false,
    IPP: '800000000',
    serviceProvider: 'Narnia',
    NDA: '200000000',
    encounterStatus: 'finished'
  },
  {
    resourceType: 'Composition',
    id: '13220951154',
    meta: {
      lastUpdated: '2020-12-10T15:09:29.000+01:00',
      tag: [
        {
          system: 'http://terminology.hl7.org/CodeSystem/v3-ObservationValue',
          code: 'SUBSETTED',
          display: 'Resource encoded in summary mode'
        }
      ]
    },
    status: 'final',
    type: {
      coding: [
        {
          system: 'https://terminology.eds.aphp.fr/aphp-orbis-document_textuel hospitalier',
          code: 'lt-cons',
          display: 'Lettre Consultation'
        }
      ]
    },
    date: '2020-08-12T19:06:40+02:00',
    title: 'Nouveau problème de cs ',
    deidentified: false,
    IPP: '800000000',
    serviceProvider: 'Narnia',
    NDA: '200000000',
    encounterStatus: 'finished'
  },
  {
    resourceType: 'Composition',
    id: '13220948159',
    meta: {
      lastUpdated: '2020-12-10T15:09:29.000+01:00',
      tag: [
        {
          system: 'http://terminology.hl7.org/CodeSystem/v3-ObservationValue',
          code: 'SUBSETTED',
          display: 'Resource encoded in summary mode'
        }
      ]
    },
    status: 'final',
    type: {
      coding: [
        {
          system: 'https://terminology.eds.aphp.fr/aphp-orbis-document_textuel hospitalier',
          code: 'cr-image',
          display: 'CR Imagerie'
        }
      ]
    },
    date: '2020-08-12T14:22:24+02:00',
    deidentified: false,
    IPP: '800000000',
    serviceProvider: 'Narnia',
    NDA: '200000000',
    encounterStatus: 'finished'
  }
]

export default documents
