import { Storage } from "@capacitor/storage";
import { UserInfo } from "../../share/InfoAuthUser";
import { AuthState, setAuth } from '../redux/reducer/authSlice';
import { ThunkDispatch, UnknownAction, Dispatch } from "@reduxjs/toolkit";

export const saveAuthData = async (user: UserInfo, token: string) => {
  await Storage.set({
    key: 'auth_user',
    value: JSON.stringify(user)
  })
  await Storage.set({
    key: 'auth_token',
    value: JSON.stringify(token)
  })
};

export const restoreAuthFromStorage = async (dispatch: ThunkDispatch<{ userInfoState: AuthState; }, undefined, UnknownAction> & Dispatch<UnknownAction>) => {
  const userResult = await Storage.get({ key: 'auth_user' });
  const userStr = userResult.value;
  if (userStr) {
    try {
      const user = JSON.parse(userStr);
      dispatch(setAuth({ user }));
      return true;
    } catch (err) {
      console.error('Lỗi parse user:', err);
    }
  }
  return false;
};
