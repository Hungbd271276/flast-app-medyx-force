import axiosInstance from '../../utils/functions/axios';

export interface ControlData {
  title: string;
  orderId: number;
  controlForm: ControlItem[];
}

export interface ControlItem {
  key: string;
  STT: number;
  controlType: string;
  validate: string;
  validateTrigger: string;
  mapfield: string;
  dataSourceApi: string;
  formRelay: string;
  body: string;
  subControl: string;
}

export const getControlData = async (formname: string): Promise<ControlData> => {
  try {
    const mockResponse = await axiosInstance.post(`/MedyxAPI/ControlList/GetPublicMenu?formname=${formname}`);
    let controlData: ControlData;
    
    if (mockResponse.data && mockResponse.data.data && Array.isArray(mockResponse.data.data)) {
      if (mockResponse.data.data.length > 0) {
        controlData = mockResponse.data.data[0];
      } else {
        throw new Error('Empty data array in response');
      }
    } else {
      throw new Error('Invalid mock response format');
    }
    if (!controlData.controlForm || !Array.isArray(controlData.controlForm)) {
      throw new Error('Missing or invalid controlForm array');
    }

    return controlData;
  } catch (error: any) {
    throw new Error(error.message || 'Không thể tải dữ liệu control');
  }
};

export const getDSPKControlData = async (): Promise<ControlData> => {
  return getControlData('DSPK');
};

export const getCustomControlData = async (formname: string): Promise<ControlData> => {
  return getControlData(formname);
};