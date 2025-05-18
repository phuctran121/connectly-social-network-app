import { createSlice } from "@reduxjs/toolkit";

const chatSlice = createSlice({
  name: "chat",
  initialState: {
    selectedUser: null,
  },
  reducers: {
    setSelectedUser: (state, action) => {
      state.selectedUser = action.payload;
    },
    resetSelectedUser: (state) => {
      state.selectedUser = null;
    },
  },
});

export const { setSelectedUser, resetSelectedUser } = chatSlice.actions;

export default chatSlice.reducer;
