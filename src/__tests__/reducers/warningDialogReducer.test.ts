import { describe, it, expect } from 'vitest'
import reducer, { showDialog, hideDialog } from 'state/warningDialog'

const initial = () => reducer(undefined, { type: '@@INIT' })

describe('warningDialog reducer', () => {
  it('a un état initial fermé', () => {
    const state = initial()
    expect(state.isOpen).toBe(false)
    expect(state.message).toBe('')
    expect(state.status).toBeUndefined()
    expect(state.onConfirm).toBeUndefined()
  })

  it('showDialog ouvre le dialogue avec message, statut et callback', () => {
    const onConfirm = () => undefined
    const state = reducer(
      initial(),
      showDialog({ isOpen: true, message: 'Attention', status: 'warning', onConfirm })
    )
    expect(state.isOpen).toBe(true)
    expect(state.message).toBe('Attention')
    expect(state.status).toBe('warning')
    expect(state.onConfirm).toBe(onConfirm)
  })

  it('hideDialog réinitialise complètement l’état', () => {
    const opened = reducer(initial(), showDialog({ isOpen: true, message: 'x', status: 'error' }))
    const state = reducer(opened, hideDialog())
    expect(state.isOpen).toBe(false)
    expect(state.message).toBe('')
    expect(state.status).toBeUndefined()
    expect(state.onConfirm).toBeUndefined()
  })

  it('showDialog gère un statut success sans callback', () => {
    const state = reducer(initial(), showDialog({ isOpen: true, message: 'ok', status: 'success' }))
    expect(state.status).toBe('success')
    expect(state.onConfirm).toBeUndefined()
  })
})
