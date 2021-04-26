import { createSlice, PayloadAction } from '@reduxjs/toolkit'

import { logout, login } from './me'
import { buildCohortCreation, saveJson, countCohortCreation } from './cohortCreation'

export type MessageState = null | {
  type?: 'success' | 'error' | 'warning' | 'info'
  content: string
}

const localStorageMessage = localStorage.getItem('message') || null
const initialState: MessageState = localStorageMessage ? JSON.parse(localStorageMessage) : null

const setMessageSlice = createSlice({
  name: 'message',
  initialState: initialState as MessageState,
  reducers: {
    clearMessage: () => {
      return null
    },
    setMessage: (state: MessageState, action: PayloadAction<MessageState>) => {
      if (!action || !action?.payload) return null
      return {
        type: action.payload.type ?? state?.type ?? 'info',
        content: action.payload.content ?? ''
      }
    }
  },
  extraReducers: (builder) => {
    builder.addCase(login, () => null)
    builder.addCase(logout, () => null)
    builder.addCase(buildCohortCreation.pending, () => ({
      type: 'info',
      content: 'Sauvegarde de la  requête'
    }))
    builder.addCase(saveJson.fulfilled, () => ({
      type: 'success',
      content: 'Requête sauvegardée'
    }))
    builder.addCase(buildCohortCreation.rejected, () => ({
      type: 'error',
      content: 'Une erreur est survenue lors de la sauvegarde de la requête'
    }))
    builder.addCase(saveJson.rejected, () => ({
      type: 'error',
      content: 'Une erreur est survenue lors de la sauvegarde de la requête'
    }))
    builder.addCase(countCohortCreation.rejected, () => ({
      type: 'error',
      content: 'Une erreur est survenue lors de la sauvegarde de la requête'
    }))
  }
})

export default setMessageSlice.reducer
export const { clearMessage, setMessage } = setMessageSlice.actions
