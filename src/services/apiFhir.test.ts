import { describe, it, expect, beforeEach, vi } from 'vitest'
import apiFhir, { fhirSearch } from './apiFhir'

describe('fhirSearch', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('POSTs to /{resource}/_search with form-urlencoded body', async () => {
    const post = vi.spyOn(apiFhir, 'post').mockResolvedValue({ data: {} } as never)

    await fhirSearch('Observation', ['code=loinc|1234,loinc|5678', '_count=20'])

    expect(post).toHaveBeenCalledTimes(1)
    const [url, body, config] = post.mock.calls[0]
    expect(url).toBe('/Observation/_search')
    expect(body).toBe('code=loinc|1234,loinc|5678&_count=20')
    expect(config?.headers?.['Content-Type']).toBe('application/x-www-form-urlencoded')
  })

  it('drops empty params so trailing/empty options do not produce stray ampersands', async () => {
    const post = vi.spyOn(apiFhir, 'post').mockResolvedValue({ data: {} } as never)

    await fhirSearch('Patient', ['', '_count=10', '', 'gender=male', ''])

    expect(post.mock.calls[0][1]).toBe('_count=10&gender=male')
  })

  it('handles an empty params list (search all)', async () => {
    const post = vi.spyOn(apiFhir, 'post').mockResolvedValue({ data: {} } as never)

    await fhirSearch('Encounter', [])

    expect(post.mock.calls[0][0]).toBe('/Encounter/_search')
    expect(post.mock.calls[0][1]).toBe('')
  })

  it('forwards AbortSignal and merges extra headers without losing the form content-type', async () => {
    const post = vi.spyOn(apiFhir, 'post').mockResolvedValue({ data: {} } as never)
    const controller = new AbortController()

    await fhirSearch('Condition', ['_count=1'], {
      signal: controller.signal,
      headers: { 'X-Trace-Id': 'abc' }
    })

    const config = post.mock.calls[0][2]
    expect(config?.signal).toBe(controller.signal)
    expect(config?.headers?.['X-Trace-Id']).toBe('abc')
    expect(config?.headers?.['Content-Type']).toBe('application/x-www-form-urlencoded')
  })

  it('preserves caller-provided value encoding verbatim in the body', async () => {
    const post = vi.spyOn(apiFhir, 'post').mockResolvedValue({ data: {} } as never)
    const encodedText = encodeURIComponent('hémoglobine glyquée')

    await fhirSearch('Observation', [`_text=${encodedText}`, 'subject.active=true'])

    expect(post.mock.calls[0][1]).toBe(`_text=${encodedText}&subject.active=true`)
  })

  it('keeps a long body intact instead of pushing it into the URL', async () => {
    const post = vi.spyOn(apiFhir, 'post').mockResolvedValue({ data: {} } as never)
    const codes = Array.from({ length: 500 }, (_, i) => `loinc|${i}`).join(',')

    await fhirSearch('Observation', [`code=${codes}`])

    const [url, body] = post.mock.calls[0]
    expect(url).toBe('/Observation/_search')
    expect((body as string).length).toBeGreaterThan(2000)
    expect(url).not.toContain('code=')
  })
})
