import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface DepartmentState {

  departmentBody: {
    listname: string;
    dk: string;
    pagesize: number;
    pagenumber: number;
  };
  departments: any[];
}

const initialState: DepartmentState = {
  departmentBody: {
    listname: "1012002",
    dk: "loai:0;cap:2;",
    pagesize: 10,
    pagenumber: 1,
  },
  departments:[]
};

const departmentSlice = createSlice({
  name: 'department',
  initialState,
  reducers: {
    setDepartments: (state, action: PayloadAction<any[]>) => {
      state.departments = action.payload;
    },
    setDepartmentParams: (state, action: PayloadAction<DepartmentState['departmentBody']>) => {
      state.departmentBody = action.payload;
    },
  },
});

export const { setDepartments, setDepartmentParams } = departmentSlice.actions;
export default departmentSlice.reducer;