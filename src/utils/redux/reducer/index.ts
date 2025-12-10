import { combineReducers } from 'redux';
import authLoginReducer, { AuthState } from './authSlice';
import listViewReducer, { ListViewState } from './listViewSlice';
import doctorReducer, { DoctorState } from '../doctorSlice';
import departmentReducer, {DepartmentState} from '../departmentSlice';
import bookingReducer, {BookingState} from '../booking';
import listFormReducer, { ListFormState } from './dynamicForm';
export type AppState = {
  userInfoState: AuthState;
  listViewState: ListViewState;
  doctorState: DoctorState;
  departmentState: DepartmentState;
  booking : BookingState;
  listFormSign: ListFormState;
}

const rootReducers = combineReducers({
  userInfoState: authLoginReducer,
  listViewState: listViewReducer,
  doctorState: doctorReducer,
  department: departmentReducer,
  booking: bookingReducer,
  listFormSign: listFormReducer,
});

export default rootReducers;
