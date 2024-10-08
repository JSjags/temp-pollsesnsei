// Import necessary functions from Redux Toolkit
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface ToggleState {
  isToggled: boolean;
}

const initialState: ToggleState = {
  isToggled: false,
};

const toggleSlice = createSlice({
  name: "toggle",
  initialState,
  reducers: {
    toggle: (state: ToggleState) => {
      state.isToggled = !state.isToggled;
    },
  },
});

// Export the action generated by the slice
export const { toggle } = toggleSlice.actions;
export default toggleSlice.reducer;
