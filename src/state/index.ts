import { store } from 'state/store'
import { useSelector, TypedUseSelectorHook } from 'react-redux'

export type RootState = ReturnType<typeof store.getState>

export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector
