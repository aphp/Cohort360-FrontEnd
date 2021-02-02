const fakeGroup = {
  resourceType: 'Group',
  id: '1',
  meta: {
    lastUpdated: '2021-01-21T15:01:28.791+01:00'
  },
  extension: [
    {
      url: 'start datetime',
      valueDate: '2021-01-21'
    }
  ],
  type: 'person',
  name: 'Created from QueryServer',
  quantity: 12,
  managingEntity: {
    display: 'Practitioner/1'
  }
}

export default fakeGroup
