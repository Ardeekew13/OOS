import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  users: null,
};

export const navSlice = createSlice({
  name: "nav",
  initialState,
  reducers: {
    setUsers: (state, action) => {
      state.users = action.payload;
    },
  },
});

export const { setUsers } = navSlice.actions;

//selectors
export const selectUsers = (state) => state.nav.users;

export default navSlice.reducer;
