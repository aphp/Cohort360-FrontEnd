export const fakeValueSetGHM = [
  {
    code: '1',
    display: 'GHM 1'
  },
  {
    code: '2',
    display: 'GHM 2'
  },
  {
    code: '3',
    display: 'GHM 3'
  },
  {
    code: '4',
    display: 'GHM 4'
  }
]

export const fakeHierarchyGHM = [
  {
    extension1: {
      code: '1',
      display: 'code impair',
      child: {
        child1: {
          code: '1',
          display: 'GHM 1'
        },
        child2: {
          code: '3',
          display: 'GHM 3'
        }
      }
    },
    extension2: {
      code: '2',
      display: 'code pair',
      child: {
        child1: {
          code: '2',
          display: 'GHM 2'
        },
        child2: {
          code: '4',
          display: 'GHM 4'
        }
      }
    }
  }
]
