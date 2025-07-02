import {
  createSlice,
  createEntityAdapter,
  createAsyncThunk,
  PayloadAction,
  Dictionary,
  createSelector
} from '@reduxjs/toolkit'
import { CriteriaItemType } from 'types'
import { CodesCache, Hierarchy } from 'types/hierarchy'
import { logout } from './me'
import { LabelObject } from 'types/searchCriterias'
import { RootState } from 'state'
import { mapCacheToCodes } from 'utils/hierarchy'
import { FhirItem } from 'types/valueSet'
import { getAllCriteriaItems } from 'components/CreationCohort/DataList_Criteria'
import { getCodeList } from 'services/aphp/serviceValueSets'

const valueSetsAdapter = createEntityAdapter<CodesCache<FhirItem>>()

export type CodeCache = { [valueSetUrl: string]: Hierarchy<FhirItem>[] }

export type ValueSetStore = { entities: Dictionary<CodesCache<FhirItem>>; cache: CodeCache }

export const prefetchSmallValueSets = async (
  criteriaTree: CriteriaItemType[]
): Promise<Array<CodesCache<FhirItem>>> => {
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
        const options = (await getCodeList(vs.id)).results
        return { id: vs.id, options: options.reduce((acc, item) => ({ ...acc, [item.id]: item }), {}) }
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

const valueSetsSlice = createSlice({
  name: 'valueSets',
  initialState: valueSetsAdapter.getInitialState({
    loading: false,
    error: false,
    loaded: false,
    cache: {} as CodeCache
  }),
  reducers: {
    saveValueSets: (state, action) => valueSetsAdapter.setMany(state, action.payload),
    updateCache: (state, action: PayloadAction<{ [valueSetUrl: string]: Hierarchy<FhirItem>[] }>) => {
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

const valueSetsSelectors = valueSetsAdapter.getSelectors((state: RootState) => state.valueSets)

const selectByIds = createSelector(
  [valueSetsSelectors.selectAll, (state: RootState, ids: string[]) => ids],
  (valueSets, ids) => valueSets.filter((valueSet) => ids.includes(valueSet.id))
)

export const selectValueSetCodes = createSelector([selectByIds], (valueSets) => mapCacheToCodes(valueSets))

export const { updateCache, saveValueSets } = valueSetsSlice.actions
export default valueSetsSlice.reducer
