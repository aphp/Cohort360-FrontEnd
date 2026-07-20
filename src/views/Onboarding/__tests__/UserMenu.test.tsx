import { configureStore } from '@reduxjs/toolkit'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import React from 'react'
import { Provider } from 'react-redux'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const { practitionerLogout } = vi.hoisted(() => ({ practitionerLogout: vi.fn() }))

vi.mock('services/aphp', () => ({
  default: { practitioner: { logout: practitionerLogout } }
}))

import meReducer, { type MeState } from 'state/me'
import UserMenu from '../UserMenu'

const renderUserMenu = (me: MeState = { displayName: 'Cesar RICHARD' } as MeState) => {
  const store = configureStore({ reducer: { me: meReducer }, preloadedState: { me } })
  render(
    <Provider store={store}>
      <MemoryRouter initialEntries={['/onboarding']}>
        <Routes>
          <Route path="/onboarding" element={<UserMenu />} />
          <Route path="/" element={<div>login page</div>} />
        </Routes>
      </MemoryRouter>
    </Provider>
  )
  return store
}

describe('UserMenu (US-3384)', () => {
  beforeEach(() => {
    practitionerLogout.mockReset()
    practitionerLogout.mockResolvedValue(undefined)
  })

  it('opens the logout action on a click on the user name (RG3384.01)', async () => {
    const user = userEvent.setup()
    renderUserMenu()

    expect(screen.queryByRole('menuitem', { name: 'Se déconnecter' })).not.toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: /Cesar RICHARD/ }))
    expect(screen.getByRole('menuitem', { name: 'Se déconnecter' })).toBeInTheDocument()
  })

  it('ends the session and goes back to the login page (RG3384.02)', async () => {
    const user = userEvent.setup()
    const store = renderUserMenu()

    await user.click(screen.getByRole('button', { name: /Cesar RICHARD/ }))
    await user.click(screen.getByRole('menuitem', { name: 'Se déconnecter' }))

    await waitFor(() => expect(practitionerLogout).toHaveBeenCalled())
    await waitFor(() => expect(store.getState().me).toBeNull())
    expect(screen.getByText('login page')).toBeInTheDocument()
  })

  it('renders nothing when no user is connected', () => {
    renderUserMenu(null)
    expect(screen.queryByRole('button')).not.toBeInTheDocument()
  })
})
