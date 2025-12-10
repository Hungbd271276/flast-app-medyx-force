import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { UserInfo } from '../../../share/InfoAuthUser';

export type AuthState = {
  user: UserInfo | null;
}

const initialState: AuthState = {
  user: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setAuth(state, action: PayloadAction<{ user: UserInfo}>) {
      state.user = action.payload.user;
    },
    clearAuth(state) {
      state.user = null;
    },
  },
});

export const { setAuth, clearAuth } = authSlice.actions;
const authLoginReducer = authSlice.reducer;
export default authLoginReducer;
