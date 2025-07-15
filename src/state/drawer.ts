/**
 * @fileoverview Drawer state slice.
 * Manages the navigation drawer open/close state.
 */

import { createSlice } from '@reduxjs/toolkit'

/** Initial state for drawer (open by default) */
const initialState = true

/**
 * Drawer slice managing navigation drawer visibility.
 *
 * Actions:
 * - open: Opens the navigation drawer
 * - close: Closes the navigation drawer
 */
const drawerSlice = createSlice({
  name: 'drawer',
  initialState,
  reducers: {
    /**
     * Opens the navigation drawer.
     */
    open: () => {
      return true
    },
    /**
     * Closes the navigation drawer.
     */
    close: () => {
      return false
    }
  }
})

export default drawerSlice.reducer
export const { open, close } = drawerSlice.actions
