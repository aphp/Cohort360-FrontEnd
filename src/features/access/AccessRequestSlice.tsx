import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { RootState } from 'state'

export type AccessRequest = {
  author: string
  date: string
  perimeterAccess: string[]
  comment?: string
  id: string
}

export type AccessRequestState = {
  requests: AccessRequest[]
}

const mockAccessRequest = (id: string): AccessRequest => ({
  id,
  author: 'Dr Marine Dijoux',
  date: '03/09/2021 17:08',
  perimeterAccess: ['Neurologie'],
  comment:
    'Ardeo, mihi credite, Patres conscripti (id quod vosmet de me existimatis et facitis ipsi) incredibili quodam amore patriae, qui me amor et subvenire olim impendentibus periculis maximis cum dimicatione capitis, et rursum, cum omnia tela undique esse intenta in patriam viderem, subire coegit atque excipere unum pro universis. Hic me meus in rem publicam animus pristinus ac perennis cum C. Caesare reducit, reconciliat, restituit in gratiam.'
})

const fetchAccessRequests = createAsyncThunk<AccessRequest[], void, { state: RootState }>(
  'fetchAccessRequests',
  async () => {
    const requests: AccessRequest[] = []

    //Fetch requests from backend instead
    for (let i = 0; i < 5; i++) {
      requests.push(mockAccessRequest(i.toString()))
    }

    return requests
  }
)

const initialState: AccessRequestState = {
  requests: []
}

const AccessRequestSlice = createSlice({
  name: 'accessRequests',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(fetchAccessRequests.fulfilled, (state, { payload }) => {
      state.requests = payload
    })
  }
})

export default AccessRequestSlice.reducer
export { fetchAccessRequests }
