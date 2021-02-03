export const fakeValueSetDiagnosticType = [
  {
    code: '1',
    display: 'Diagnostic 1'
  },
  {
    code: '2',
    display: 'Diagnostic 2'
  },
  {
    code: '3',
    display: 'Diagnostic 3'
  },
  {
    code: '4',
    display: 'Diagnostic 4'
  }
]

export const fakeValueSetCIM10 = [
  {
    code: '1',
    display: 'CIM10 1'
  },
  {
    code: '2',
    display: 'CIM10 2'
  },
  {
    code: '3',
    display: 'CIM10 3'
  },
  {
    code: '4',
    display: 'CIM10 4'
  }
]

export const fakeHierarchyCIM10 = [
  {
    extension1: {
      code: '1',
      display: 'code impair',
      child: {
        child1: {
          code: '1',
          display: 'CIM10 1'
        },
        child2: {
          code: '3',
          display: 'CIM10 3'
        }
      }
    },
    extension2: {
      code: '2',
      display: 'code pair',
      child: {
        child1: {
          code: '2',
          display: 'CIM10 2'
        },
        child2: {
          code: '4',
          display: 'CIM10 4'
        }
      }
    }
  }
]
