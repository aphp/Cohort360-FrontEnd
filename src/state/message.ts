import { createSlice, PayloadAction } from '@reduxjs/toolkit'

import { logout, login } from './me'
import {
  buildCohortCreation,
  saveJson,
  countCohortCreation,
  unbuildCohortCreation,
  fetchRequestCohortCreation
} from './cohortCreation'
import { addProject, editProject, deleteProject, fetchProjects } from './project'
import { addRequest, editRequest, deleteRequest, fetchRequests, moveRequests, deleteRequests } from './request'
import { addCohort, deleteCohort, editCohort, fetchCohorts } from './cohort'
import { favoriteExploredCohort, fetchExploredCohort } from './exploredCohort'
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
      if (!action || !action?.payload) return null
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
    builder.addCase(addProject.rejected, () => ({
      type: 'error',
      content: 'Une erreur est survenue lors de la création du projet de recherche'
    }))
    builder.addCase(editProject.rejected, () => ({
      type: 'error',
      content: 'Une erreur est survenue lors de la modification du projet de recherche'
    }))
    builder.addCase(deleteProject.rejected, () => ({
      type: 'error',
      content: 'Une erreur est survenue lors de la suppression de votre projet de recherche'
    }))
    builder.addCase(addRequest.rejected, () => ({
      type: 'error',
      content: 'Une erreur est survenue lors de la création de la requête'
    }))
    builder.addCase(editRequest.rejected, () => ({
      type: 'error',
      content: "Une erreur est survenue lors de l'édition de la requête"
    }))
    builder.addCase(deleteRequest.rejected, () => ({
      type: 'error',
      content: 'Une erreur est survenue lors de la suppression de votre requête'
    }))
    builder.addCase(deleteRequests.rejected, () => ({
      type: 'error',
      content: 'Une erreur est survenue lors de la suppression de vos requêtes'
    }))
    builder.addCase(countCohortCreation.rejected, () => ({
      type: 'error',
      content: 'Une erreur est survenue lors de la sauvegarde de la requête'
    }))
    builder.addCase(fetchCohorts.rejected, () => ({
      type: 'error',
      content: 'Une erreur est survenue lors de la récupération des cohortes'
    }))
    builder.addCase(addCohort.rejected, () => ({
      type: 'error',
      content: 'Une erreur est survenue lors de la création de la cohorte'
    }))
    builder.addCase(editCohort.rejected, () => ({
      type: 'error',
      content: "Une erreur est survenue lors de l'édition de la cohorte"
    }))
    builder.addCase(deleteCohort.rejected, () => ({
      type: 'error',
      content: 'Une erreur est survenue lors de la suppression de la cohorte'
    }))
    builder.addCase(fetchRequestCohortCreation.rejected, () => ({
      type: 'error',
      content: 'Une erreur est survenue lors de la récupération de la requête'
    }))
    builder.addCase(fetchExploredCohort.rejected, () => ({
      type: 'error',
      content: 'Une erreur est survenue lors de la récupération de la cohorte'
    }))
    builder.addCase(favoriteExploredCohort.rejected, () => ({
      type: 'error',
      content: 'Une erreur est survenue lors de la mise en favori de la cohorte'
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
    builder.addCase(moveRequests.rejected, () => ({
      type: 'error',
      content: 'Une erreur est survenue lors de la migration de la requête'
    }))
  }
})

export default setMessageSlice.reducer
export const { clearMessage, setMessage } = setMessageSlice.actions
