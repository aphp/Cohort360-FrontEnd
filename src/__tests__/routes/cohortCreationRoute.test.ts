import { describe, expect, it } from 'vitest'
import { matchPath } from 'react-router'

// The three former /cohort/new routes were merged into a single route with
// optional params so navigating from /cohort/new to /cohort/new/:requestId no
// longer remounts CohortCreation (which caused a duplicate snapshot POST).
// We validate the matching behaviour of that consolidated pattern here without
// importing the full route config (which pulls in heavy view dependencies).
const COHORT_NEW_PATH = '/cohort/new/:requestId?/:snapshotId?'

describe('consolidated /cohort/new route pattern', () => {
  it('matches /cohort/new without params', () => {
    const match = matchPath(COHORT_NEW_PATH, '/cohort/new')
    expect(match).not.toBeNull()
    expect(match?.params.requestId).toBeUndefined()
    expect(match?.params.snapshotId).toBeUndefined()
  })

  it('matches /cohort/new/:requestId', () => {
    const match = matchPath(COHORT_NEW_PATH, '/cohort/new/req-123')
    expect(match).not.toBeNull()
    expect(match?.params.requestId).toBe('req-123')
    expect(match?.params.snapshotId).toBeUndefined()
  })

  it('matches /cohort/new/:requestId/:snapshotId', () => {
    const match = matchPath(COHORT_NEW_PATH, '/cohort/new/req-123/snap-456')
    expect(match).not.toBeNull()
    expect(match?.params.requestId).toBe('req-123')
    expect(match?.params.snapshotId).toBe('snap-456')
  })
})
