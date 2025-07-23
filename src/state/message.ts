import { createSlice, PayloadAction } from '@reduxjs/toolkit'

import { logout, login } from './me'
import {
  buildCohortCreation,
  saveJson,
  countCohortCreation,
  unbuildCohortCreation,
  fetchRequestCohortCreation
} from './cohortCreation'
import { fetchProjects } from './project'
import { addRequest, fetchRequests } from './request'
import { fetchExploredCohort } from './exploredCohort'
import { fetchAllProcedures, fetchLastPmsiInfo, fetchPatientInfo } from './patient'

export type MessageState = null | {
  type?: 'success' | 'error' | 'warning' | 'info'
  content: string
}

const setMessageSlice = createSlice({
  name: 'message',
  initialState: null as MessageState,
  reducers: {
    clearMessage: () => {
      return null
    },
    setMessage: (state: MessageState, action: PayloadAction<MessageState>) => {
      if (!action?.payload) return null
      return {
        type: action.payload.type ?? state?.type ?? 'info',
        content: action.payload.content ?? ''
      }
    }
  },
  extraReducers: (builder) => {
    builder.addCase(login, () => null)
    builder.addCase(logout.fulfilled, () => null)
    builder.addCase(logout.rejected, () => ({
      type: 'error',
      content: 'Une erreur est survenue lors de la déconnexion'
    }))
    builder.addCase(buildCohortCreation.rejected, () => ({
      type: 'error',
      content: 'Une erreur est survenue lors de la récupération de la requête'
    }))
    builder.addCase(unbuildCohortCreation.rejected, () => ({
      type: 'error',
      content: 'Une erreur est survenue lors de la déconstruction de la requête'
    }))
    builder.addCase(saveJson.rejected, () => ({
      type: 'error',
      content: 'Une erreur est survenue lors de la sauvegarde de la requête'
    }))
    builder.addCase(addRequest.rejected, () => ({
      type: 'error',
      content: 'Une erreur est survenue lors de la création de la requête'
    }))
    builder.addCase(countCohortCreation.rejected, () => ({
      type: 'error',
      content: 'Une erreur est survenue lors de la sauvegarde de la requête'
    }))
    builder.addCase(fetchRequestCohortCreation.rejected, () => ({
      type: 'error',
      content: 'Une erreur est survenue lors de la récupération de la requête'
    }))
    builder.addCase(fetchExploredCohort.rejected, () => ({
      type: 'error',
      content: 'Une erreur est survenue lors de la récupération de la cohorte'
    }))
    builder.addCase(fetchPatientInfo.rejected, () => ({
      type: 'error',
      content: 'Une erreur est survenue lors de la récupération des informations du patient'
    }))
    builder.addCase(fetchLastPmsiInfo.rejected, () => ({
      type: 'error',
      content: 'Une erreur est survenue lors de la récupération des dernières informations PMSI du patient'
    }))
    builder.addCase(fetchAllProcedures.rejected, () => ({
      type: 'error',
      content: 'Une erreur est survenue lors de la récupération des PMSI du patient'
    }))
    builder.addCase(fetchProjects.rejected, () => ({
      type: 'error',
      content: 'Une erreur est survenue lors de la récupération des projets'
    }))
    builder.addCase(fetchRequests.rejected, () => ({
      type: 'error',
      content: 'Une erreur est survenue lors de la récupération des requêtes'
    }))
  }
})

export default setMessageSlice.reducer
export const { clearMessage, setMessage } = setMessageSlice.actions
