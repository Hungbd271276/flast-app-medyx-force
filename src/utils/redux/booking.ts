import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../../utils/functions/axios';

interface DynamicApiParams {
  endpoint: string;
  body: any;
  params?: any;
}

export const fetchPublicFormInfo = createAsyncThunk(
  'booking/fetchPublicFormInfo',
  async (formname: string) => {
    const res = await axiosInstance.post(`/MedyxAPI/ControlList/GetPublicMenu?formname=${formname}`);
    return res.data;
  }
);

export const fetchKhungGioKham = createAsyncThunk(
  'booking/fetchKhungGioKham',
  async (_, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.post('/MedyxAPI/BenhNhan/GetPublicList', {
        listname: 'KhungGioKham',
        pagesize: 20,
        pagenumber: 1,
        dk: ''
      });
      return res.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const fetchDoctor = createAsyncThunk(
  'booking/fetchDoctor',
  async (maKhoa: string, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.post('/MedyxAPI/ControlList/GetComBoBoxData', {
        listname: '19002',
        pagesize: 20,
        pagenumber: 1,
        dk: `MaKhoa:${maKhoa};MaCV:014`
      });
      return res.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const fetchServiceListDynamic = createAsyncThunk(
  'booking/fetchServiceListDynamic',
  async (
    params: { dataSourceApi: string; body: string },
    { rejectWithValue }
  ) => {
    try {
      const res = await axiosInstance.post(
        '/' + params.dataSourceApi,
        JSON.parse(params.body)
      );
      return res.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const fetchPayment = createAsyncThunk(
  'booking/fetchPayment',
  async (_, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.post('/MedyxAPI/ControlList/GetComBoBoxData', {
        listname: 'PTTT',
        pagesize: 20,
        pagenumber: 1,
        dk: ``
      });
      return res.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const fetchBHYTInfo = createAsyncThunk(
  'booking/fetchBHYTInfo',
  async (
    params: { SoCCCD: string; HO_TEN: string; NGAY_SINH: string },
    { getState, rejectWithValue }
  ) => {
    const state: any = getState();
    const cached = state.booking.bhytInfo;
    if (
      cached &&
      cached.SoCCCD === params.SoCCCD &&
      cached.HO_TEN === params.HO_TEN &&
      cached.NGAY_SINH === params.NGAY_SINH
    ) {
      return cached;
    }
    try {
      const res = await axiosInstance.post(
        '/MedyxAPI/BenhNhan/GetCheckBHYTByCCCD',
        {},
        { params }
      );
      return res.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const registerKCB = createAsyncThunk(
  'booking/registerKCB',
  async (body: any, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.post('/MedyxAPI/BenhNhan/RegisterKCB', body);
      return res.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

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

export interface BookingState {
  publicMenu: {
    errorCode: number;
    message: string;
    totalRow: number;
    data: any[];
  } | null;
  khungGioKham: any[];
  doctorList: any[];
  paymentList: any[];
  loading: boolean; // Loading cho fetchPublicFormInfo và KhungGioKham/Payment nếu cần
  error: string | null;
  formData: Record<string, any>;
  defaultValues: Record<string, string>;
  advancedOption: boolean;
  selectedDepartmentId: number | null;
  selectedDoctorId: string | null;
  selectedDate: Date | null;
  selectedTimeSlot: String | null;
  selectedPaymentMethod: string | null;
  bhytInfo: any | null;
  bhytLoading: boolean;
  bhytError: string | null;
  serviceList: any[];
  serviceListLoading: boolean;
  serviceListError: string | null;
  selectedServiceId: string | null;
  // Bạn có thể thêm loading/error riêng cho doctorList nếu muốn quản lý chi tiết hơn
  // doctorLoading: boolean;
  // doctorError: string | null;
  registrationResult: any | null;
  registrationLoading: boolean;
  registrationError: string | null;
}

const initialState: BookingState = {
  publicMenu: null,
  khungGioKham: [],
  doctorList: [],
  paymentList: [],
  loading: false,
  error: null,
  formData: {},
  defaultValues: {},
  advancedOption: false,
  selectedDepartmentId: null,
  selectedDoctorId: null,
  selectedDate: null,
  selectedTimeSlot: null,
  selectedPaymentMethod: null,
  bhytInfo: null, // Nên là null nếu chưa có dữ liệu
  bhytLoading: false,
  bhytError: null,
  serviceList: [],
serviceListLoading: false,
serviceListError: null,
  selectedServiceId: null,
  registrationResult: null,
  registrationLoading: false,
  registrationError: null,
  // doctorLoading: false,
  // doctorError: null,
};


const bookingSlice = createSlice({
  name: 'booking',
  initialState,
  reducers: {
    setFormData: (state, action) => {
      state.formData = { ...state.formData, ...action.payload };
    },
    setDefaultValues: (state, action) => {
      state.defaultValues = { ...state.defaultValues, ...action.payload };
    },
    clearFormData: (state) => {
      state.formData = {};
      state.defaultValues = {};
    },
    clearBookingState: (state) => {
      state.publicMenu = null;
      state.loading = false;
      state.error = null;
      state.formData = {};
      state.defaultValues = {};
      state.bhytInfo = null;
      state.bhytLoading = false;
      state.bhytError = null;
      state.selectedDepartmentId = null;
      state.selectedDoctorId = null;
      state.selectedDate = null;
      state.selectedTimeSlot = null;
      state.selectedPaymentMethod = null;
      state.advancedOption = false;
      state.khungGioKham = [];
      state.doctorList = [];
      state.paymentList = [];
    },
    setAdvancedOption: (state, action) => {
      state.advancedOption = action.payload;
    },
    setSelectedDepartment: (state, action) => {
      state.selectedDepartmentId = action.payload;
    },
    setSelectedDoctor: (state, action) => {
      state.selectedDoctorId = action.payload;
    },
    setSelectedDate: (state, action) => {
      state.selectedDate = action.payload;
    },
    setSelectedTimeSlot: (state, action) => {
      state.selectedTimeSlot = action.payload;
    },
    setSelectedPaymentMethod: (state, action) => {
      state.selectedPaymentMethod = action.payload;
    },
    setSelectedService: (state, action) => {
      state.selectedServiceId = action.payload;
    },
    setRegistrationResult: (state, action) => {
      state.registrationResult = action.payload;
    },
    setRegistrationError: (state, action) => {
      state.registrationError = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPublicFormInfo.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPublicFormInfo.fulfilled, (state, action) => {
        state.loading = false;
        state.publicMenu = action.payload;
      })
      .addCase(fetchPublicFormInfo.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Lỗi khi tải menu';
      })
      .addCase(fetchKhungGioKham.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchServiceListDynamic.pending, (state) => {
        state.serviceListLoading = true;
        state.serviceListError = null;
      })
      .addCase(fetchServiceListDynamic.fulfilled, (state, action) => {
        state.serviceListLoading = false;
        state.serviceList = action.payload?.newsList || action.payload?.data || [];
      })
      .addCase(fetchServiceListDynamic.rejected, (state, action) => {
        state.serviceListLoading = false;
        state.serviceListError = action.error?.message || 'Lỗi khi tải dịch vụ';
      })
      .addCase(fetchKhungGioKham.fulfilled, (state, action) => {
        state.loading = false;
        state.khungGioKham = action.payload?.data || [];
      })
      .addCase(fetchKhungGioKham.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error?.message || 'Lỗi khi tải khung giờ khám';
      })
      .addCase(fetchPayment.pending, (state) => {
        state.loading = true; // Sử dụng loading chung cho payment
        state.error = null;
      })
      .addCase(fetchPayment.fulfilled, (state, action) => {
        state.loading = false;
        state.paymentList = action.payload?.newsList || [];
      })
      .addCase(fetchPayment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error?.message || 'Lỗi khi tải phương thức thanh toán';
      })
      // BHYT Info - chỉ sử dụng bhytLoading và bhytError
      .addCase(fetchBHYTInfo.pending, (state) => {
        state.bhytLoading = true;
        state.bhytError = null;
      })
      .addCase(fetchBHYTInfo.fulfilled, (state, action) => {
        state.bhytLoading = false;
        state.bhytInfo = action.payload;
      })
      .addCase(fetchBHYTInfo.rejected, (state, action) => {
        state.bhytLoading = false;
        state.bhytError = action.error?.message || 'Lỗi khi tải thông tin BHYT';
      })
      .addCase(registerKCB.pending, (state) => {
        state.registrationLoading = true;
        state.registrationError = null;
      })
      .addCase(registerKCB.fulfilled, (state, action) => {
        state.registrationLoading = false;
        state.registrationResult = action.payload;
      })
      .addCase(registerKCB.rejected, (state, action) => {
        state.registrationLoading = false;
        state.registrationError = action.error?.message || 'Đăng ký thất bại';
      })
      // Doctor List - nếu muốn loading riêng thì phải thêm state tương ứng
      .addCase(fetchDoctor.pending, (state) => {
        // state.doctorLoading = true; // Nếu có state loading riêng cho doctor
        state.error = null; // Cập nhật lỗi chung hoặc lỗi riêng cho doctor
      })
      .addCase(fetchDoctor.fulfilled, (state, action) => {
        // state.doctorLoading = false;
        state.doctorList = action.payload.newsList || [];
      })
      .addCase(fetchDoctor.rejected, (state, action) => {
        // state.doctorLoading = false;
        state.error = action.error?.message || 'Lỗi khi tải danh sách bác sĩ';
      });
  },
});

export const {
  setFormData,
  setDefaultValues,
  clearFormData,
  clearBookingState,
  setAdvancedOption,
  setSelectedDepartment,
  setSelectedDoctor,
  setSelectedDate,
  setSelectedTimeSlot,
  setSelectedPaymentMethod,
  setSelectedService,
  setRegistrationResult,
  setRegistrationError
} = bookingSlice.actions;

export default bookingSlice.reducer;