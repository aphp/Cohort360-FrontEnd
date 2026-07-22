import { beforeEach, describe, expect, it, vi } from 'vitest'

const { post, getUri } = vi.hoisted(() => ({
  post: vi.fn(),
  getUri: vi.fn()
}))

vi.mock('services/apiBackend', () => ({
  default: { post, getUri }
}))

vi.mock('services/aphp/callApi', () => ({
  fetchExportTableInfo: vi.fn(),
  fetchExportTableRelationInfo: vi.fn(),
  fetchExportList: vi.fn(),
  retryExport: vi.fn()
}))

vi.mock('config', () => ({
  getConfig: () => ({ features: { export: { exportTables: [] } } })
}))

import { downloadExport } from './serviceExportCohort'

describe('downloadExport', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    post.mockResolvedValue({ data: { expires_in: 60 } })
    getUri.mockReturnValue('/api/back/exports/export-id/download/')
  })

  it('requests a ticket then starts a native browser download', async () => {
    const signal = new AbortController().signal
    const click = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => undefined)

    await downloadExport('export-id', signal)

    expect(post).toHaveBeenCalledWith('/exports/export-id/download-ticket/', undefined, { signal })
    expect(getUri).toHaveBeenCalledWith({ url: '/exports/export-id/download/' })
    expect(click).toHaveBeenCalledOnce()
    expect(document.querySelector('a')).toBeNull()

    click.mockRestore()
  })

  it('does not start a download when ticket creation fails', async () => {
    post.mockRejectedValue(new Error('ticket unavailable'))
    const click = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => undefined)

    await expect(downloadExport('export-id')).rejects.toThrow('ticket unavailable')
    expect(click).not.toHaveBeenCalled()

    click.mockRestore()
  })
})
