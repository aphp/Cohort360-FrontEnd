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
import { expandBiologyElement, fetchBiology, initBiologyHierarchy } from './biology'
import { addCohort, deleteCohort, editCohort, fetchCohorts } from './cohort'
import { favoriteExploredCohort, fetchExploredCohort } from './exploredCohort'
import { expandMedicationElement, fetchMedication, initMedicationHierarchy } from './medication'
import {
  fetchAllProcedures,
  fetchBiology as fetchBiologyPatient,
  fetchDocuments,
  fetchLastPmsiInfo,
  fetchMedication as fetchMedicationPatient,
  fetchPatientInfo,
  fetchPmsi
} from './patient'
import { expandPmsiElement, fetchClaim, fetchCondition, fetchProcedure, initPmsiHierarchy } from './pmsi'
import { expandScopeElement, fetchScopesList } from './scope'

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
    builder.addCase(buildCohortCreation.pending, () => ({
      type: 'info',
      content: 'Sauvegarde de la requête'
    }))
    builder.addCase(buildCohortCreation.rejected, () => ({
      type: 'error',
      content: 'Une erreur est survenue lors de la récupération de la requête'
    }))
    builder.addCase(unbuildCohortCreation.rejected, () => ({
      type: 'error',
      content: 'Une erreur est survenue lors de la déconstruction de la requête'
    }))
    builder.addCase(saveJson.fulfilled, () => ({
      type: 'success',
      content: 'Requête sauvegardée'
    }))
    builder.addCase(saveJson.rejected, () => ({
      type: 'error',
      content: 'Une erreur est survenue lors de la sauvegarde de la requête'
    }))
    builder.addCase(addProject.fulfilled, () => ({
      type: 'success',
      content: 'Projet de recherche ajouté'
    }))
    builder.addCase(addProject.rejected, () => ({
      type: 'error',
      content: 'Une erreur est survenue lors de la création du projet de recherche'
    }))
    builder.addCase(editProject.fulfilled, () => ({
      type: 'success',
      content: 'Projet de recherche modifié'
    }))
    builder.addCase(editProject.rejected, () => ({
      type: 'error',
      content: 'Une erreur est survenue lors de la modification du projet de recherche'
    }))
    builder.addCase(deleteProject.fulfilled, () => ({
      type: 'success',
      content: 'Projet de recherche supprimé'
    }))
    builder.addCase(deleteProject.rejected, () => ({
      type: 'error',
      content: 'Une erreur est survenue lors de la suppression de votre projet de recherche'
    }))
    builder.addCase(addRequest.fulfilled, () => ({
      type: 'success',
      content: 'Requête ajoutée'
    }))
    builder.addCase(addRequest.rejected, () => ({
      type: 'error',
      content: 'Une erreur est survenue lors de la création de la requête'
    }))
    builder.addCase(editRequest.fulfilled, () => ({
      type: 'success',
      content: 'Requête modifiée'
    }))
    builder.addCase(editRequest.rejected, () => ({
      type: 'error',
      content: "Une erreur est survenue lors de l'édition de la requête"
    }))
    builder.addCase(deleteRequest.fulfilled, () => ({
      type: 'success',
      content: 'Requête supprimée'
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
    builder.addCase(initBiologyHierarchy.rejected, () => ({
      type: 'error',
      content: 'Une erreur est survenue lors de la récupération de la hiérarchie de biologie'
    }))
    builder.addCase(fetchBiology.rejected, () => ({
      type: 'error',
      content: 'Une erreur est survenue lors de la récupération de la hiérarchie de biologie'
    }))
    builder.addCase(expandBiologyElement.rejected, () => ({
      type: 'error',
      content: 'Une erreur est survenue lors de la récupération des enfants dans la hiérarchie de biologie'
    }))
    builder.addCase(initMedicationHierarchy.rejected, () => ({
      type: 'error',
      content: 'Une erreur est survenue lors de la récupération de la hiérarchie des médicaments'
    }))
    builder.addCase(fetchMedication.rejected, () => ({
      type: 'error',
      content: 'Une erreur est survenue lors de la récupération de la hiérarchie des médicaments'
    }))
    builder.addCase(expandMedicationElement.rejected, () => ({
      type: 'error',
      content: 'Une erreur est survenue lors de la récupération des enfants la hiérarchie des médicaments'
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
    builder.addCase(fetchDocuments.rejected, () => ({
      type: 'error',
      content: 'Une erreur est survenue lors de la récupération des documents du patient'
    }))
    builder.addCase(fetchPmsi.rejected, () => ({
      type: 'error',
      content: 'Une erreur est survenue lors de la récupération des PMSI du patient'
    }))
    builder.addCase(fetchMedicationPatient.rejected, () => ({
      type: 'error',
      content: 'Une erreur est survenue lors de la récupération des données médicament du patient'
    }))
    builder.addCase(fetchBiologyPatient.rejected, () => ({
      type: 'error',
      content: 'Une erreur est survenue lors de la récupération des données de biologie du patient'
    }))
    builder.addCase(initPmsiHierarchy.rejected, () => ({
      type: 'error',
      content: 'Une erreur est survenue lors de la récupération de la hiérarchie des PMSI'
    }))
    builder.addCase(fetchCondition.rejected, () => ({
      type: 'error',
      content: 'Une erreur est survenue lors de la récupération de la hiérarchie des diagnostics CIM10'
    }))
    builder.addCase(fetchClaim.rejected, () => ({
      type: 'error',
      content: 'Une erreur est survenue lors de la récupération de la hiérarchie des GHM'
    }))
    builder.addCase(fetchProcedure.rejected, () => ({
      type: 'error',
      content: 'Une erreur est survenue lors de la récupération de la hiérarchie des actes'
    }))
    builder.addCase(expandPmsiElement.rejected, () => ({
      type: 'error',
      content: 'Une erreur est survenue lors de la récupération des enfants de la hiérarchie des PMSI'
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
    builder.addCase(fetchScopesList.rejected, () => ({
      type: 'error',
      content: 'Une erreur est survenue lors de la récupération de la liste des périmètres'
    }))
    builder.addCase(expandScopeElement.rejected, () => ({
      type: 'error',
      content: 'Une erreur est survenue lors de la récupération des enfants du périmètre'
    }))
  }
})

export default setMessageSlice.reducer
export const { clearMessage, setMessage } = setMessageSlice.actions
