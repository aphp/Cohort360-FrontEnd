import { createSlice, createEntityAdapter, createAsyncThunk, PayloadAction, Dictionary } from '@reduxjs/toolkit'
import { fetchValueSet } from 'services/aphp/callApi'
import { CriteriaItemType, HierarchyElementWithSystem } from 'types'
import { logout } from './me'
import { LabelObject } from 'types/searchCriterias'
import { getAllCriteriaItems } from 'components/CreationCohort/DataList_Criteria'

export type ValueSetOptions = {
  id: string
  options: HierarchyElementWithSystem[]
}

export type CodeCache = { [system: string]: LabelObject[] }

export type ValueSetStore = { entities: Dictionary<ValueSetOptions>; cache: CodeCache }

export const prefetchSmallValueSets = async (criteriaTree: CriteriaItemType[]): Promise<Array<ValueSetOptions>> => {
  const criteriaList = getAllCriteriaItems(criteriaTree)

  // fetch all unique valueSetIds from the criteriaList
  const uniqueValueSetIds = criteriaList
    .flatMap((criterion) => {
      const criterionValuesets = criterion.formDefinition?.itemSections.flatMap((section) => {
        const sectionValuesets = section.items
          .map((item) => {
            if (item.type === 'autocomplete') {
              return { id: item.valueSetId, data: item.valueSetData }
            }
            return null
          })
          .filter((item) => item !== null)
          .map((item) => item as { id: string; data?: LabelObject[] })
        return sectionValuesets
      })

      return criterionValuesets || []
    })
    .reduce((acc, item) => {
      if (!acc.some((existingItem) => existingItem.id === item.id)) {
        acc.push(item)
      }
      return acc
    }, [] as { id: string; data?: LabelObject[] }[])

  // fetch them
  return await Promise.all(
    uniqueValueSetIds.map(async (vs) => {
      if (vs.data) {
        return { id: vs.id, options: vs.data }
      }
      try {
        const options = await fetchValueSet(vs.id, {
          joinDisplayWithCode: false,
          sortingKey: 'id'
        })
        return { id: vs.id, options }
      } catch (e) {
        console.error(`Error fetching valueSet ${vs.id}`, e)
        return { id: vs.id, options: [] }
      }
    })
  )
}

export const initValueSets = createAsyncThunk('valueSets/initValueSets', async (criteriaList: CriteriaItemType[]) => {
  const response = await prefetchSmallValueSets(criteriaList)
  return response
})

const valueSetsAdapter = createEntityAdapter<ValueSetOptions>()

const valueSetsSlice = createSlice({
  name: 'valueSets',
  initialState: valueSetsAdapter.getInitialState({
    loading: false,
    error: false,
    loaded: false,
    cache: {} as CodeCache
  }),
  reducers: {
    addValueSets: valueSetsAdapter.addMany,
    updateCache: (state, action: PayloadAction<CodeCache>) => {
      return {
        ...state,
        cache: action.payload
      }
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(logout.fulfilled, () =>
        valueSetsAdapter.getInitialState({ loading: false, error: false, loaded: false, cache: {} })
      )
      .addCase(initValueSets.pending, (state) => {
        state.loading = true
        state.error = false
      })
      .addCase(initValueSets.fulfilled, (state, action) => {
        valueSetsAdapter.setAll(state, action.payload)
        state.loading = false
        state.loaded = true
      })
      .addCase(initValueSets.rejected, (state) => {
        state.loading = false
        state.error = true
      })
  }
})

export const { addValueSets, updateCache } = valueSetsSlice.actions
export default valueSetsSlice.reducer
