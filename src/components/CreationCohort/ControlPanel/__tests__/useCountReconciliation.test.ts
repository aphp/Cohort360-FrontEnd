import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook } from '@testing-library/react'

import { type CohortCount, JobStatus } from 'types'
import {
  useCountReconciliation,
  POLL_INTERVAL_MS,
  STUCK_TIMEOUT_MS
} from '../useCountReconciliation'

const mockDispatch = vi.fn()
const mockCountCohort = vi.fn()

vi.mock('state', () => ({
  useAppDispatch: () => mockDispatch
}))

vi.mock('state/cohortCreation', () => ({
  updateCount: (payload: unknown) => ({ type: 'cohortCreation/updateCount', payload })
}))

vi.mock('services/aphp', () => ({
  default: {
    cohortCreation: {
      countCohort: (...args: unknown[]) => mockCountCohort(...args)
    }
  }
}))

const advance = (ms: number) => vi.advanceTimersByTimeAsync(ms)

describe('useCountReconciliation', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    mockDispatch.mockClear()
    mockCountCohort.mockReset()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('does not poll when count is undefined', async () => {
    renderHook(() => useCountReconciliation(undefined))
    await advance(POLL_INTERVAL_MS * 2)
    expect(mockCountCohort).not.toHaveBeenCalled()
    expect(mockDispatch).not.toHaveBeenCalled()
  })

  it('does not poll when status is already terminal', async () => {
    const count: CohortCount = { uuid: 'dm-1', status: JobStatus.FINISHED }
    renderHook(() => useCountReconciliation(count))
    await advance(POLL_INTERVAL_MS * 2)
    expect(mockCountCohort).not.toHaveBeenCalled()
  })

  it('polls while status is non-terminal and dispatches updateCount on terminal transition', async () => {
    const count: CohortCount = { uuid: 'dm-1', status: JobStatus.STARTED }
    mockCountCohort
      .mockResolvedValueOnce({ uuid: 'dm-1', status: JobStatus.STARTED })
      .mockResolvedValueOnce({
        uuid: 'dm-1',
        status: JobStatus.FINISHED,
        includePatient: 42,
        extra: { foo: 'bar' },
        snapshotId: 'snap-1'
      })

    renderHook(() => useCountReconciliation(count))

    await advance(POLL_INTERVAL_MS)
    expect(mockCountCohort).toHaveBeenCalledTimes(1)
    expect(mockCountCohort).toHaveBeenLastCalledWith(undefined, undefined, undefined, 'dm-1')
    expect(mockDispatch).not.toHaveBeenCalled()

    await advance(POLL_INTERVAL_MS)
    expect(mockCountCohort).toHaveBeenCalledTimes(2)
    expect(mockDispatch).toHaveBeenCalledTimes(1)
    expect(mockDispatch).toHaveBeenCalledWith({
      type: 'cohortCreation/updateCount',
      payload: {
        status: JobStatus.FINISHED,
        includePatient: 42,
        jobFailMsg: undefined,
        extra: { foo: 'bar' },
        snapshotId: 'snap-1'
      }
    })
  })

  it('marks count as errored after STUCK_TIMEOUT_MS without terminal transition', async () => {
    const count: CohortCount = { uuid: 'dm-stuck', status: JobStatus.STARTED }
    mockCountCohort.mockResolvedValue({ uuid: 'dm-stuck', status: JobStatus.STARTED })

    renderHook(() => useCountReconciliation(count))

    const ticksBeforeBail = Math.floor(STUCK_TIMEOUT_MS / POLL_INTERVAL_MS)
    for (let i = 0; i < ticksBeforeBail - 1; i++) {
      await advance(POLL_INTERVAL_MS)
    }
    expect(mockDispatch).not.toHaveBeenCalled()

    await advance(POLL_INTERVAL_MS)

    expect(mockDispatch).toHaveBeenCalledTimes(1)
    const action = mockDispatch.mock.calls[0][0]
    expect(action.type).toBe('cohortCreation/updateCount')
    expect(action.payload.status).toBe('error')
    expect(action.payload.jobFailMsg).toMatch(/moteur de calcul/)
  })

  it('stops polling and resets stuck timer when uuid changes', async () => {
    const first: CohortCount = { uuid: 'dm-1', status: JobStatus.STARTED }
    const second: CohortCount = { uuid: 'dm-2', status: JobStatus.STARTED }

    mockCountCohort.mockResolvedValue({ status: JobStatus.STARTED })

    const { rerender } = renderHook((c: CohortCount) => useCountReconciliation(c), {
      initialProps: first
    })

    const ticksBeforeBail = Math.floor(STUCK_TIMEOUT_MS / POLL_INTERVAL_MS)
    for (let i = 0; i < ticksBeforeBail - 2; i++) {
      await advance(POLL_INTERVAL_MS)
    }

    rerender(second)

    for (let i = 0; i < ticksBeforeBail - 1; i++) {
      await advance(POLL_INTERVAL_MS)
    }

    expect(mockDispatch).not.toHaveBeenCalled()
    expect(mockCountCohort).toHaveBeenLastCalledWith(undefined, undefined, undefined, 'dm-2')
  })

  it('swallows transient network errors and keeps polling', async () => {
    const count: CohortCount = { uuid: 'dm-1', status: JobStatus.STARTED }
    mockCountCohort
      .mockRejectedValueOnce(new Error('network down'))
      .mockResolvedValueOnce({ status: JobStatus.FINISHED, includePatient: 7 })

    renderHook(() => useCountReconciliation(count))

    await advance(POLL_INTERVAL_MS)
    expect(mockDispatch).not.toHaveBeenCalled()

    await advance(POLL_INTERVAL_MS)
    expect(mockDispatch).toHaveBeenCalledTimes(1)
    expect(mockDispatch.mock.calls[0][0].payload.status).toBe(JobStatus.FINISHED)
  })
})
