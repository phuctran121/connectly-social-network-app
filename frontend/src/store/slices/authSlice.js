import { createSlice } from "@reduxjs/toolkit";

const authSlice = createSlice({
  name: "auth",
  initialState: {
    onlineUsers: [],
  },
  reducers: {
    setOnlineUsers: (state, action) => {
      state.onlineUsers = action.payload;
    },
  },
});

export const {
  setIsSigningUp,
  setIsLoggingIn,
  setIsUpdatingProfile,
  setIsCheckingAuth,
  setOnlineUsers,
} = authSlice.actions;

export default authSlice.reducer;
