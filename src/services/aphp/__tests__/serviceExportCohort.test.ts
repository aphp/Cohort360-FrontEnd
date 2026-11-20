import { AxiosError, AxiosHeaders } from 'axios'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const post = vi.fn()

vi.mock('services/apiBackend', () => ({
  default: {
    post: (...args: unknown[]) => post(...args),
    defaults: { baseURL: '/api/back' }
  }
}))

import { downloadExport, ExportDownloadError } from '../serviceExportCohort'

const assign = vi.fn()
const originalLocation = window.location

// what the apiBackend interceptor resolves with on a 4xx/5xx
const axiosErrorWithStatus = (status: number) =>
  new AxiosError('Request failed', 'ERR_BAD_RESPONSE', undefined, undefined, {
    status,
    statusText: '',
    data: 'Error',
    headers: {},
    config: { headers: new AxiosHeaders() }
  })

beforeEach(() => {
  post.mockReset()
  assign.mockClear()
  Object.defineProperty(window, 'location', { value: { assign }, writable: true, configurable: true })
})

afterEach(() => {
  Object.defineProperty(window, 'location', { value: originalLocation, writable: true, configurable: true })
})

describe('downloadExport', () => {
  it('lets the browser download the export with the export download token', async () => {
    post.mockResolvedValue({ status: 200, data: { token: 'a:b/c+d' } })
    await downloadExport('export-uuid')
    expect(post).toHaveBeenCalledWith('/exports/export-uuid/download-token/', null, { signal: undefined })
    expect(assign).toHaveBeenCalledWith('/api/back/exports/export-uuid/download/?token=a%3Ab%2Fc%2Bd')
  })

  it.each([
    [400, "L'export n'est pas disponible au téléchargement (non terminé ou fichiers supprimés)."],
    [503, 'Le stockage est momentanément indisponible, réessayez plus tard.'],
    [500, 'Le stockage est momentanément indisponible, réessayez plus tard.'],
    [403, 'Erreur lors du téléchargement.']
  ])('throws the message of a %i without downloading', async (status, message) => {
    post.mockResolvedValue(axiosErrorWithStatus(status))
    const error = await downloadExport('export-uuid').catch((e) => e)
    expect(error).toBeInstanceOf(ExportDownloadError)
    expect(error.status).toBe(status)
    expect(error.message).toBe(message)
    expect(assign).not.toHaveBeenCalled()
  })

  it('throws a generic error when the interceptor swallows a network failure', async () => {
    post.mockResolvedValue(undefined)
    await expect(downloadExport('export-uuid')).rejects.toThrow('Erreur lors du téléchargement.')
    expect(assign).not.toHaveBeenCalled()
  })

  it('throws the message of a rejected request', async () => {
    post.mockRejectedValue(axiosErrorWithStatus(503))
    await expect(downloadExport('export-uuid')).rejects.toThrow('Le stockage est momentanément indisponible')
    post.mockRejectedValue(new Error('boom'))
    await expect(downloadExport('export-uuid')).rejects.toThrow('Erreur lors du téléchargement.')
    expect(assign).not.toHaveBeenCalled()
  })

  it('throws when the response carries no token', async () => {
    post.mockResolvedValue({ status: 200, data: {} })
    await expect(downloadExport('export-uuid')).rejects.toBeInstanceOf(ExportDownloadError)
    post.mockResolvedValue({ status: 204, data: '' })
    const error = await downloadExport('export-uuid').catch((e) => e)
    expect(error.status).toBe(204)
    expect(assign).not.toHaveBeenCalled()
  })

  it('does nothing when the token request was cancelled', async () => {
    const controller = new AbortController()
    controller.abort()
    post.mockResolvedValue(undefined)
    await expect(downloadExport('export-uuid', controller.signal)).resolves.toBeUndefined()
    expect(assign).not.toHaveBeenCalled()
  })
})
