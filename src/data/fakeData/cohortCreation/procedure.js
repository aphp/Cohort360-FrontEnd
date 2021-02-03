export const fakeValueSetCCAM = [
  {
    code: '1',
    display: 'CCAM 1'
  },
  {
    code: '2',
    display: 'CCAM 2'
  },
  {
    code: '3',
    display: 'CCAM 3'
  },
  {
    code: '4',
    display: 'CCAM 4'
  }
]

export const fakeHierarchyCCAM = [
  {
    extension1: {
      code: '1',
      display: 'code impair',
      child: {
        child1: {
          code: '1',
          display: 'CCAM 1'
        },
        child2: {
          code: '3',
          display: 'CCAM 3'
        }
      }
    },
    extension2: {
      code: '2',
      display: 'code pair',
      child: {
        child1: {
          code: '2',
          display: 'CCAM 2'
        },
        child2: {
          code: '4',
          display: 'CCAM 4'
        }
      }
    }
  }
]
