import { renderHook } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

const { mockUseAppSelector } = vi.hoisted(() => ({
  mockUseAppSelector: vi.fn()
}))

vi.mock('state', () => ({
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  useAppSelector: (selector: any) => mockUseAppSelector(selector)
}))

import useMaintenanceIsActive from '../useMaintenanceIsActive'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const renderWith = (me: any) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  mockUseAppSelector.mockImplementation((selector: any) => selector({ me }))
  return renderHook(() => useMaintenanceIsActive()).result.current
}

describe('useMaintenanceIsActive', () => {
  it('est inactif sans maintenance', () => {
    expect(renderWith(null)).toBe(false)
    expect(renderWith({})).toBe(false)
    expect(renderWith({ maintenance: { active: false, type: 'partial' } })).toBe(false)
  })

  it('est actif pour un utilisateur non exempté', () => {
    expect(renderWith({ maintenance: { active: true, type: 'partial' } })).toBe(true)
    expect(renderWith({ maintenance: { active: true, type: 'partial' }, maintenanceExempted: false })).toBe(true)
  })

  it('laisse passer un utilisateur exempté pendant une maintenance partielle', () => {
    expect(renderWith({ maintenance: { active: true, type: 'partial' }, maintenanceExempted: true })).toBe(false)
  })

  it('reste actif pour un utilisateur exempté pendant une maintenance complète', () => {
    expect(renderWith({ maintenance: { active: true, type: 'full' }, maintenanceExempted: true })).toBe(true)
  })
})
