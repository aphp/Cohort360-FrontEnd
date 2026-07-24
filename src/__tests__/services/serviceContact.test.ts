import { describe, it, expect, beforeEach, vi } from 'vitest'
import { AxiosResponse } from 'axios'

vi.mock('../../services/apiBackend', () => ({
  default: { post: vi.fn() }
}))

import apiBackend from '../../services/apiBackend'
import serviceContact from 'services/aphp/serviceContact'

const mockPost = vi.mocked(apiBackend.post)

const asAxios = (status: number): AxiosResponse =>
  ({ data: {}, status, statusText: '', headers: {}, config: {} }) as AxiosResponse

beforeEach(() => {
  vi.clearAllMocks()
})

describe('serviceContact.postIssue', () => {
  it('retourne true quand le ticket est créé (status 201)', async () => {
    mockPost.mockResolvedValue(asAxios(201))
    const form = new FormData()
    form.append('subject', 'Bug')
    const result = await serviceContact.postIssue(form)
    expect(result).toBe(true)
    expect(mockPost).toHaveBeenCalledWith(
      '/voting/create-issue',
      form,
      expect.objectContaining({ headers: { 'content-type': 'multipart/form-data' } })
    )
  })

  it('retourne false quand le status n’est pas 201', async () => {
    mockPost.mockResolvedValue(asAxios(200))
    expect(await serviceContact.postIssue(new FormData())).toBe(false)
  })

  it('retourne false et log l’erreur en cas d’échec API', async () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    mockPost.mockRejectedValue(new Error('network error'))
    expect(await serviceContact.postIssue(new FormData())).toBe(false)
    expect(errorSpy).toHaveBeenCalled()
    errorSpy.mockRestore()
  })
})
