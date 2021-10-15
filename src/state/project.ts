import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit'
import { RootState } from 'state'
import { ProjectType } from 'types'

import { logout, login } from './me'

import services from 'services'

export type ProjectState = {
  loading: boolean
  count: number
  selectedProject: ProjectType | null
  projectsList: ProjectType[]
}

const defaultInitialState: ProjectState = {
  loading: false,
  count: 0,
  selectedProject: null,
  projectsList: []
}

const localStorageProject = localStorage.getItem('project') || null
const initialState: ProjectState = localStorageProject ? JSON.parse(localStorageProject) : defaultInitialState

type FetchProjectListReturn = {
  count: number
  selectedProject: null
  projectsList: ProjectType[]
}

const fetchProjects = createAsyncThunk<FetchProjectListReturn, void, { state: RootState }>(
  'project/fetchProjects',
  async (DO_NOT_USE, { getState }) => {
    try {
      const state = getState().project

      const oldProjectList = state.projectsList || []
      const projects = (await services.projects.fetchProjectsList(100, 0)) || []

      if (state.count === projects.count) {
        return {
          count: state.count,
          selectedProject: null,
          projectsList: oldProjectList
        }
      }

      let projectList = projects.results || []
      if (projects.count > projectList.length) {
        const newResult = await services.projects.fetchProjectsList(
          projects.count - projectList.length,
          projectList.length
        )
        // Add elements to projectList array and filter doublon
        projectList = [...projectList, ...(newResult.results || [])]
        projectList = projectList.filter((item, index, array) => {
          const foundItem = array.find(({ uuid }) => item.uuid === uuid)
          const currentIndex = foundItem ? array.indexOf(foundItem) : -1
          return index === currentIndex
        })
      }

      return {
        count: projects.count,
        selectedProject: null,
        projectsList: projectList.reverse()
      }
    } catch (error) {
      console.error(error)
      throw error
    }
  }
)
/**
 * addProject
 *
 */
type AddProjectParams = {
  newProject: ProjectType
}
type AddProjectReturn = {
  selectedProject: null
  projectsList: ProjectType[]
}

const addProject = createAsyncThunk<AddProjectReturn, AddProjectParams, { state: RootState }>(
  'project/addProject',
  async ({ newProject }, { getState }) => {
    try {
      const state = getState().project
      const projectsList: ProjectType[] = state.projectsList ?? []

      const createdProject = await services.projects.addProject(newProject)

      return {
        selectedProject: null,
        projectsList: createdProject !== null ? [createdProject, ...projectsList] : projectsList
      }
    } catch (error) {
      console.error(error)
      throw error
    }
  }
)

/**
 * editProject
 *
 */
type EditProjectParams = {
  editedProject: ProjectType
}
type EditProjectReturn = {
  selectedProject: null
  projectsList: ProjectType[]
}

const editProject = createAsyncThunk<EditProjectReturn, EditProjectParams, { state: RootState }>(
  'project/editProject',
  async ({ editedProject }, { getState, dispatch }) => {
    try {
      const state = getState().project
      // eslint-disable-next-line
      let projectsList: ProjectType[] = state.projectsList ? [...state.projectsList] : []
      const foundItem = projectsList.find(({ uuid }) => uuid === editedProject.uuid)
      if (!foundItem) {
        // if not found -> create it
        dispatch(addProject({ newProject: editedProject }))
      } else {
        const index = projectsList.indexOf(foundItem)

        const modifiedProject = await services.projects.editProject(editedProject)

        projectsList[index] = modifiedProject
      }
      return {
        selectedProject: null,
        projectsList: projectsList
      }
    } catch (error) {
      console.error(error)
      throw error
    }
  }
)
/**
 * deleteProject
 *
 */
type DeleteProjectParams = {
  deletedProject: ProjectType
}
type DeleteProjectReturn = {
  selectedProject: null
  projectsList: ProjectType[]
}

const deleteProject = createAsyncThunk<DeleteProjectReturn, DeleteProjectParams, { state: RootState }>(
  'project/deleteProject',
  async ({ deletedProject }, { getState }) => {
    try {
      const state = getState().project
      // eslint-disable-next-line
      let projectsList: ProjectType[] = state.projectsList ? [...state.projectsList] : []
      const foundItem = projectsList.find(({ uuid }) => uuid === deletedProject.uuid)
      const index = foundItem ? projectsList.indexOf(foundItem) : -1
      if (index !== -1) {
        // delete item at index
        await services.projects.deleteProject(deletedProject)

        projectsList.splice(index, 1)
      }
      return {
        selectedProject: null,
        projectsList: projectsList
      }
    } catch (error) {
      console.error(error)
      throw error
    }
  }
)

const setProjectSlice = createSlice({
  name: 'project',
  initialState: initialState as ProjectState,
  reducers: {
    clearProject: () => {
      return defaultInitialState
    },
    setSelectedProject: (state: ProjectState, action: PayloadAction<string | null>) => {
      const projectsList: ProjectType[] = state.projectsList ?? []
      const selectedProjectId = action.payload
      switch (selectedProjectId) {
        case null:
          return {
            ...state,
            selectedProject: null
          }
        case '':
          return {
            ...state,
            selectedProject: {
              uuid: '',
              name: `Projet de recherche ${projectsList.length}`,
              description: ''
            }
          }
        default: {
          const foundItem = projectsList.find(({ uuid }) => uuid === selectedProjectId)
          if (!foundItem) return state
          const index = projectsList.indexOf(foundItem)
          return {
            ...state,
            selectedProject: projectsList[index]
          }
        }
      }
    }
  },
  extraReducers: (builder) => {
    builder.addCase(login, () => defaultInitialState)
    builder.addCase(logout, () => defaultInitialState)
    // fetchProjects
    builder.addCase(fetchProjects.pending, (state) => ({ ...state, loading: true }))
    builder.addCase(fetchProjects.fulfilled, (state, action) => ({ ...state, ...action.payload, loading: false }))
    builder.addCase(fetchProjects.rejected, (state) => ({ ...state, loading: false }))
    // addProject
    builder.addCase(addProject.pending, (state) => ({ ...state, loading: true }))
    builder.addCase(addProject.fulfilled, (state, action) => ({ ...state, ...action.payload, loading: false }))
    builder.addCase(addProject.rejected, (state) => ({ ...state, loading: false }))
    // editProject
    builder.addCase(editProject.pending, (state) => ({ ...state, loading: true }))
    builder.addCase(editProject.fulfilled, (state, action) => ({ ...state, ...action.payload, loading: false }))
    builder.addCase(editProject.rejected, (state) => ({ ...state, loading: false }))
    // deleteProject
    builder.addCase(deleteProject.pending, (state) => ({ ...state, loading: true }))
    builder.addCase(deleteProject.fulfilled, (state, action) => ({ ...state, ...action.payload, loading: false }))
    builder.addCase(deleteProject.rejected, (state) => ({ ...state, loading: false }))
  }
})

export default setProjectSlice.reducer
export { fetchProjects, addProject, editProject, deleteProject }
export const { clearProject, setSelectedProject } = setProjectSlice.actions
