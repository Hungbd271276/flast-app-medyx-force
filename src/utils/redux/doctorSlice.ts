import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import axiosInstance from '../functions/axios';

export type Doctor = {
  avatar: string; // Đổi tên trường cho đúng với API trả về
  name: string;
  id?: string;
  specialty?: string;
  experience?: string;
  // ... các trường khác nếu cần
};
interface DynamicApiParams {
    endpoint: string;
    body: any;
    params?: any;
  }
export type DoctorParams = {
  listname: string;
  dk: string;
  pagesize: number;
  pagenumber: number;
};

const initialState: DoctorState = {
  doctors: [],
  params: {
    listname: "19002",
    dk: "",
    pagesize: 5,
    pagenumber: 1
  },
  loading: false,
  error: null,
  dynamicData: null,
  dynamicLoading: false,
  dynamicError: null
};
export type DoctorState = {
    doctors: Doctor[];
    params: DoctorParams;
    loading: boolean;
    error: string | null;
    dynamicData: any | null;
    dynamicLoading: boolean;
    dynamicError: string | null;
  };

export const callDynamicApi = createAsyncThunk(
    'api/callDynamicApi',
    async ({ endpoint, body, params }: DynamicApiParams, { rejectWithValue }) => {
      try {
        const res = await axiosInstance.post(endpoint, body, { params });
        return res.data;
      } catch (error: any) {
        return rejectWithValue(error.response?.data || error.message);
      }
    }
  );


const doctorSlice = createSlice({
  name: 'doctor',
  initialState,
  reducers: {
    setDoctors(state, action: PayloadAction<Doctor[]>) {
      state.doctors = action.payload;
    },
    clearDoctors(state) {
      state.doctors = [];
    },
    setDoctorParams(state, action: PayloadAction<Partial<DoctorParams>>) {
      state.params = { ...state.params, ...action.payload };
    },
    resetDoctorParams(state) {
      state.params = initialState.params;
    },
    clearDynamicData(state) {
        state.dynamicData = null;
        state.dynamicError = null;
      }
  },
  extraReducers: (builder) => {
    builder
      .addCase(callDynamicApi.pending, (state) => {
        state.dynamicLoading = true;
        state.dynamicError = null;
      })
      .addCase(callDynamicApi.fulfilled, (state, action) => {
        state.dynamicLoading = false;
        state.dynamicData = action.payload;
      })
      .addCase(callDynamicApi.rejected, (state, action) => {
        state.dynamicLoading = false;
        state.dynamicError = action.error?.message || 'Lỗi khi gọi API';
      });
  },
});

export const { setDoctors, clearDoctors, setDoctorParams, resetDoctorParams, clearDynamicData } = doctorSlice.actions;
export default doctorSlice.reducer;