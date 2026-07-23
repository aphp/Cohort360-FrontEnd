import { renderHook } from '@testing-library/react'
import React from 'react'
import { describe, expect, it, vi } from 'vitest'

const { mockUseAppSelector } = vi.hoisted(() => ({
  mockUseAppSelector: vi.fn()
}))

vi.mock('state', () => ({
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  useAppSelector: (selector: any) => mockUseAppSelector(selector)
}))

import { AppConfig, type AppConfig as AppConfigType } from 'config'
import useOnboardingEnabled from '../useOnboardingEnabled'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const setMe = (me: any) => mockUseAppSelector.mockImplementation((selector: any) => selector({ me }))

const renderWith = (enabled: boolean, allowedAphCodes: string[]) => {
  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <AppConfig.Provider value={{ features: { onboarding: { enabled, allowedAphCodes } } } as unknown as AppConfigType}>
      {children}
    </AppConfig.Provider>
  )
  return renderHook(() => useOnboardingEnabled(), { wrapper }).result.current
}

describe('useOnboardingEnabled', () => {
  it('reste désactivé pour tous par défaut (flag off, liste vide)', () => {
    setMe({ userName: '4163302' })
    expect(renderWith(false, [])).toBe(false)
  })

  it('est actif pour tous quand le flag est on, sans regarder la liste', () => {
    setMe({ userName: '4163302' })
    expect(renderWith(true, [])).toBe(true)
    expect(renderWith(true, ['7069721'])).toBe(true)
  })

  it('active les codes APH listés même quand le flag global est off', () => {
    setMe({ userName: '4163302' })
    expect(renderWith(false, ['4163302', '7069721'])).toBe(true)
    expect(renderWith(false, ['7069721'])).toBe(false)
  })

  it('reste désactivé sans code APH utilisateur quand seule la liste pilote', () => {
    setMe(null)
    expect(renderWith(false, ['4163302'])).toBe(false)
  })
})
