import { describe, expect, it } from 'vitest'
import meReducer, { clearUser, login, type MeState } from 'state/me'

const user: MeState = {
  id: 'userA',
  userName: 'userA',
  displayName: 'User A',
  firstName: 'User',
  lastName: 'A',
  deidentified: false,
  accessExpirations: []
}

describe('me reducer', () => {
  it("clearUser oublie l'utilisateur persisté", () => {
    const state = meReducer(null, login(user))
    expect(meReducer(state, clearUser())).toBeNull()
  })
})
