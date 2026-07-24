import { configureStore } from '@reduxjs/toolkit'
import { beforeEach, describe, expect, it, vi } from 'vitest'

// createSnapshot is the only path that POSTs /cohort/request-query-snapshots/.
// We mock it so we can count how many times a snapshot creation is actually
// requested for a given sequence of saveJson dispatches.
const createSnapshot = vi.fn()

vi.mock('services/aphp', () => ({
  default: {
    cohortCreation: {
      createSnapshot: (...args: any[]) => createSnapshot(...args)
    }
  }
}))

import { rootReducer } from 'state/store'
import {
  saveJson,
  resetCohortCreation,
  fetchRequestCohortCreation
} from 'state/cohortCreation'

// Use the full rootReducer so the store's state matches the RootState type the
// saveJson thunk is typed against (createAsyncThunk<..., { state: RootState }>).
const makeStore = () =>
  configureStore({
    reducer: rootReducer,
    middleware: (getDefaultMiddleware) => getDefaultMiddleware({ serializableCheck: false })
  })

const snapshotResponse = (uuid: string, version: number) => ({
  uuid,
  created_at: '2024-01-01T00:00:00Z',
  cohorts_count: 0,
  patients_count: 0,
  version,
  serialized_query: '{}',
  dated_measures: []
})

const seedRequest = (store: ReturnType<typeof makeStore>, requestId: string) => {
  // Give the request an id (and keep snapshotsHistory empty) so saveJson takes
  // the createSnapshot branch.
  store.dispatch({
    type: fetchRequestCohortCreation.fulfilled.type,
    payload: { requestId, snapshotsHistory: [] }
  })
}

describe('saveJson duplicate-POST guard', () => {
  beforeEach(() => {
    createSnapshot.mockReset()
  })

  it('creates a single snapshot when the same save is dispatched twice concurrently', async () => {
    const store = makeStore()
    seedRequest(store, 'req-1')

    let resolveSnapshot: (value: unknown) => void = () => {}
    createSnapshot.mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          resolveSnapshot = resolve
        })
    )

    // Two dispatches in the same tick: the second must be blocked by the guard.
    const first = store.dispatch(saveJson({ newJson: '{"a":1}' }))
    const second = store.dispatch(saveJson({ newJson: '{"a":1}' }))

    resolveSnapshot(snapshotResponse('snap-1', 1))
    await Promise.all([first, second])

    expect(createSnapshot).toHaveBeenCalledTimes(1)
  })

  it('does not issue a second POST while the first save is still in flight', async () => {
    const store = makeStore()
    seedRequest(store, 'req-2')

    let resolveSnapshot: (value: unknown) => void = () => {}
    createSnapshot.mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          resolveSnapshot = resolve
        })
    )

    const first = store.dispatch(saveJson({ newJson: '{"b":1}' }))
    // Dispatched in a later tick while the first POST has not resolved yet.
    await Promise.resolve()
    const second = store.dispatch(saveJson({ newJson: '{"b":1}' }))

    resolveSnapshot(snapshotResponse('snap-2', 1))
    await Promise.all([first, second])

    expect(createSnapshot).toHaveBeenCalledTimes(1)
  })

  it('allows a subsequent save once the previous one has settled', async () => {
    const store = makeStore()
    seedRequest(store, 'req-3')

    createSnapshot
      .mockResolvedValueOnce(snapshotResponse('snap-3a', 1))
      .mockResolvedValueOnce(snapshotResponse('snap-3b', 2))

    await store.dispatch(saveJson({ newJson: '{"c":1}' }))
    await store.dispatch(saveJson({ newJson: '{"c":2}' }))

    expect(createSnapshot).toHaveBeenCalledTimes(2)
  })

  it('releases the guard after a failed save so the next save can run', async () => {
    const store = makeStore()
    seedRequest(store, 'req-4')

    createSnapshot
      .mockRejectedValueOnce(new Error('network error'))
      .mockResolvedValueOnce(snapshotResponse('snap-4', 1))

    await store.dispatch(saveJson({ newJson: '{"d":1}' }))
    await store.dispatch(saveJson({ newJson: '{"d":2}' }))

    // First rejected, guard released in finally, second succeeds.
    expect(createSnapshot).toHaveBeenCalledTimes(2)
  })

  it('releases the guard even when resetCohortCreation clears saveLoading mid-flight', async () => {
    const store = makeStore()
    seedRequest(store, 'req-5')

    let resolveSnapshot: (value: unknown) => void = () => {}
    createSnapshot.mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          resolveSnapshot = resolve
        })
    )

    const first = store.dispatch(saveJson({ newJson: '{"e":1}' }))
    // A reset (as happens on the open-request flow) puts saveLoading back to
    // false while the first POST is still in flight; the module-scoped guard
    // must still block the overlapping save.
    store.dispatch(resetCohortCreation())
    seedRequest(store, 'req-5')
    const second = store.dispatch(saveJson({ newJson: '{"e":1}' }))

    resolveSnapshot(snapshotResponse('snap-5', 1))
    await Promise.all([first, second])

    expect(createSnapshot).toHaveBeenCalledTimes(1)
  })
})
