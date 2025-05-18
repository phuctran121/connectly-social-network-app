import { createSlice } from "@reduxjs/toolkit";

const notificationSlice = createSlice({
  name: "notification",
  initialState: {
    isVisible: false,
    message: "",
    postId: null,
  },
  reducers: {
    showNotification: (state, action) => {
      state.isVisible = true;
      state.message = action.payload.message;
      state.postId = action.payload.postId;
    },
    hideNotification: (state) => {
      state.isVisible = false;
      state.message = "";
      state.postId = null;
    },
  },
});

export const { showNotification, hideNotification } = notificationSlice.actions;
export default notificationSlice.reducer;
