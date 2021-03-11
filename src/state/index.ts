import { store } from 'state/store'
import { useSelector, TypedUseSelectorHook, useDispatch } from 'react-redux'

export type RootState = ReturnType<typeof store.getState>

export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector
export type AppDispatch = typeof store.dispatch
export const useAppDispatch = () => useDispatch<AppDispatch>()
