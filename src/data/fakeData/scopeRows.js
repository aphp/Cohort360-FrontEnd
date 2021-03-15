const scopeRows = [
  {
    resourceType: 'Group',
    id: '1',
    name: 'Faux APHP',
    quantity: 6,
    subItems: [{ resourceType: 'Group', id: '3', name: 'Faux service', quantity: 2, subItems: [], parentId: '1' }]
  },
  { resourceType: 'Group', id: '2', name: 'Faux Rotschild', quantity: 7, subItems: [] }
]

export default scopeRows
