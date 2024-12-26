import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { RootState } from 'state'
import { ProjectType } from 'types'

import { logout, login, impersonate } from './me'

import services from 'services/aphp'

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
      const projects = (await services.projects.fetchProjectsList({})) || []

      if (state.count === projects.count) {
        return {
          count: state.count,
          selectedProject: null,
          projectsList: oldProjectList
        }
      }

      let projectList = projects.results || []
      if (projects.count > projectList.length) {
        const newResult = await services.projects.fetchProjectsList({})
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

const setProjectSlice = createSlice({
  name: 'project',
  initialState: defaultInitialState,
  reducers: {
    setProjectsList: (state, action) => {
      state.projectsList = action.payload.projectsList
      state.count = action.payload.count
    },
    setSelectedProject: (state, action) => {
      state.selectedProject = action.payload
    }
  },
  extraReducers: (builder) => {
    builder.addCase(login, () => defaultInitialState)
    builder.addCase(logout.fulfilled, () => defaultInitialState)
    builder.addCase(impersonate, () => defaultInitialState)
    // fetchProjects
    builder.addCase(fetchProjects.pending, (state) => ({ ...state, loading: !state.count }))
    builder.addCase(fetchProjects.fulfilled, (state, action) => ({ ...state, ...action.payload, loading: false }))
    builder.addCase(fetchProjects.rejected, (state) => ({ ...state, loading: false }))
  }
})

export default setProjectSlice.reducer
export { fetchProjects }
export const { setProjectsList, setSelectedProject } = setProjectSlice.actions
