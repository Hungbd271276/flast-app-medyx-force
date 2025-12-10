import {
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonContent,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonGrid,
  IonRow,
  IonCol,
  IonText,
  IonIcon,
  IonModal,
  IonButton,
} from '@ionic/react';
import React, { useEffect, useMemo, useState } from 'react';
import { useSelector, useDispatch } from '../../../utils/redux/hooks';
import DinamicForm from '../../../components/dinamicForm/DinamicForm';
import { formatDateToDDMMYYYY, getStartHour } from '../../../utils/functions/dateUtils';
import axiosInstance from '../../../utils/functions/axios';
import { setRegistrationError, setRegistrationResult } from '../../../utils/redux/booking';
import { InAppBrowser } from '@awesome-cordova-plugins/in-app-browser';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { downloadOutline } from 'ionicons/icons';
import { isPlatform } from '@ionic/react';
import './RegisterPage.css';

interface RegisterPageProps {
  activeTab?: string,
  onNext: () => void;
  onBack: () => void;
}

// ... [giữ nguyên import như bạn đã có]

const RegisterPage: React.FC<RegisterPageProps> = ({activeTab, onNext, onBack }) => {
  const dispatch = useDispatch();
  const {
    publicMenu,
    formData,
    defaultValues,
    selectedDepartmentId,
    selectedDoctorId,
    selectedDate,
    selectedTimeSlot,
    selectedServiceId,
    selectedPaymentMethod,
    registrationResult
  } = useSelector((state: any) => state.booking);

  const controlForms = useMemo(() => {
    return publicMenu?.data?.find((item: any) => item.title === 'Đăng ký khám')?.controlForm || [];
  }, [publicMenu]);

  const [viewRequestBody, setViewRequestBody] = useState<Record<string, any> | null>(null);
  const [selectOptions, setSelectOptions] = useState<Record<string, { value: string, label: string }[]>>({});
  const [showModal, setShowModal] = useState(false);
  const [modalContent, setModalContent] = useState<string | React.ReactNode>('');
  const [isQRModal, setIsQRModal] = useState(false);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const formatDate = (value: any) => {
    if (!value) return null;
    const date = new Date(value);
    if (isNaN(date.getTime())) return value;
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}T00:00:00`;
  };

  const fetchSelectOptions = async (mapfield: string, dataSourceApi: string, body: string) => {
    try {
      const requestBody = body ? JSON.parse(body) : {};
      const res = await axiosInstance.post(dataSourceApi, requestBody);
      const rawData = res.data.newsList || [];
      const processedOptions = rawData
        .filter((item: any) => item.id)
        .map((item: any) => ({ value: item.id, label: item.name }));
      setSelectOptions(prev => ({ ...prev, [mapfield]: processedOptions }));
    } catch {
      setSelectOptions(prev => ({ ...prev, [mapfield]: [] }));
    }
  };

  const saveQRCode = async (base64Data: string) => {
    setIsSaving(true);
    try {
      if (isPlatform('capacitor')) {
        // Chỉ xử lý mobile
        const fileName = `QR_Payment_${Date.now()}.png`;

        await Filesystem.writeFile({
          path: fileName,
          data: base64Data,
          directory: Directory.Documents,
        });

        alert('QR Code đã được lưu vào thiết bị!');
      } else {
        // Web: không làm gì cả hoặc thông báo
        alert('Chức năng này chỉ khả dụng trên mobile!');
      }
    } catch (error) {
      console.error('Lỗi khi lưu QR code:', error);
      alert('Không thể lưu QR code. Vui lòng thử lại!');
    } finally {
      setIsSaving(false);
    }
  };

  useEffect(() => {
    if (!viewRequestBody) return;
    for (const key of Object.keys(viewRequestBody)) {
      for (const section of publicMenu?.data || []) {
        const found = section.controlForm?.find((ctrl: any) => ctrl.mapfield === key);
        if (found && found.dataSourceApi && !selectOptions[key]) {
          fetchSelectOptions(key, found.dataSourceApi, found.body);
        }
      }
    }
    // eslint-disable-next-line
  }, [viewRequestBody, publicMenu]);

  useEffect(() => {
    const control = controlForms.find((ctrl: any) => ctrl.mapfield);
    if (!control) return;

    try {
      const { body, formRelay } = control;
      const fields: string[] = JSON.parse(formRelay);
      const baseBody = JSON.parse(body.replace(/:\s*(?=,|})/g, ': null'));

      const fieldData = Object.fromEntries(
        fields.map((f: string) => {
          const value = formData[f] ?? defaultValues[f] ?? '';
          return [
            f,
            typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)
              ? formatDate(value)
              : value
          ];
        })
      );

      const requestBody = {
        ...baseBody,
        ...fieldData,
        ...defaultValues,
        ...formData,
        MaKhoa: selectedDepartmentId,
        MaBS: selectedDoctorId,
        KhungThoiGian: `${formatDateToDDMMYYYY(selectedDate)} ${getStartHour(selectedTimeSlot)}`,
        MaDV: selectedServiceId,
        MaPTTT: selectedPaymentMethod,
      };
      setViewRequestBody(requestBody);
    } catch (err) {
      console.error('Lỗi khởi tạo requestBody:', err);
    }
  }, [
    controlForms,
    formData,
    defaultValues,
    selectedDepartmentId,
    selectedDoctorId,
    selectedDate,
    selectedTimeSlot,
    selectedServiceId,
    selectedPaymentMethod,
    registrationResult
  ]);

  const mapReduxDataToField = (fieldName: string): any => {
    if (!registrationResult || !registrationResult.data) return null;

    // Tìm trực tiếp trong registrationResult.data
    if (registrationResult.data[fieldName] !== undefined) {
      return registrationResult.data[fieldName];
    }

    // Tìm trong các object con của registrationResult.data
    for (const key of Object.keys(registrationResult.data)) {
      const section = registrationResult.data[key];
      if (section && typeof section === 'object' && section[fieldName] !== undefined) {
        return section[fieldName];
      }
    }

    // Tìm trong formData và defaultValues
    if (formData[fieldName] !== undefined) return formData[fieldName];
    if (defaultValues[fieldName] !== undefined) return defaultValues[fieldName];

    return null;
  };

  const processRequestBody = (requestBody: Record<string, any>): Record<string, any> => {
    const processedBody = { ...requestBody };

    Object.keys(processedBody).forEach(key => {
      const value = processedBody[key];
      if (typeof value === 'string' && value.includes(':')) {
        const [fieldName, fieldValue] = value.split(':');
        if (!fieldValue) {
          const reduxValue = mapReduxDataToField(fieldName);
          if (reduxValue !== null && reduxValue !== undefined) {
            processedBody[key] = `${fieldName}:${reduxValue}`;
          }
        }
      }
    });

    return processedBody;
  };

  // ✅ GỌI API KHI BẤM NÚT
  const handleAction = async (mapfield?: string) => {
    try {
      const control = controlForms.find((ctrl: any) => ctrl.mapfield === mapfield);
      if (!control) return;

      const { dataSourceApi, body, formRelay } = control;
      const fields: string[] = JSON.parse(formRelay);
      const baseBody = JSON.parse(body.replace(/:\s*(?=,|})/g, ': null'));

      const fieldData = Object.fromEntries(
        fields.map((f: string) => {
          const value = formData[f] ?? defaultValues[f] ?? '';
          return [
            f,
            typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)
              ? formatDate(value)
              : value
          ];
        })
      );

      let requestBody = {
        ...baseBody,
        ...fieldData,
        ...defaultValues,
        ...formData,
        MaKhoa: selectedDepartmentId,
        MaBS: selectedDoctorId,
        KhungThoiGian: `${formatDateToDDMMYYYY(selectedDate)} ${getStartHour(selectedTimeSlot)}`,
        MaDV: selectedServiceId,
        MaPTTT: selectedPaymentMethod,
      };
      // Xử lý mapping dữ liệu từ Redux
      requestBody = processRequestBody(requestBody);
      setViewRequestBody(requestBody);
      requestBody = Object.fromEntries(
        Object.entries(requestBody).map(([key, value]) => [key, value === null ? "" : value])
      );

      const res = await axiosInstance.post(dataSourceApi, requestBody);
      dispatch(setRegistrationResult(res.data));
      console.log('✅ Đã lưu vào Redux:', res.data);
      console.log('res.data:', res.data);
      const qrCode = res.data?.data?.thonG_TIN_THANH_TOAN?.qR_CODE;
      const pdfArray = Array.isArray(res.data?.data) ? res.data.data : null;
      const pdfBase64 = pdfArray && typeof pdfArray[0] === 'string' ? pdfArray[0] : null;
      if (qrCode) {
        setModalContent(
          <div className='qr-modal-content'>
            <h3>Quét mã QR để thanh toán</h3>
            <div className="qr-image-container">
              <img src={`data:image/png;base64,${qrCode}`} alt="QR Code" />
              <div className='download-action' onClick={() => saveQRCode(qrCode)}>
                <IonIcon
                  icon={downloadOutline}
                  className="download-icon"
                /><label>Lưu ảnh</label>
              </div>
            </div>
            {isSaving && <p className="saving-text">Đang lưu...</p>}
          </div>
        );
        setIsQRModal(true);
        setShowModal(true);
      } else if (pdfBase64) {
        const fullUrl = `${import.meta.env.VITE_API_URL}/MedyxAPI/PDF?Path=${encodeURIComponent(pdfBase64)}`;
        try {
          InAppBrowser.create(fullUrl, '_system', {
            location: 'yes',
            toolbar: 'yes'
          });
        } catch (error) {
          window.open(fullUrl, '_system');
        }
        setIsQRModal(false);
      } else {
        setShowSuccessPopup(true);
      }
    } catch (err: any) {
      dispatch(setRegistrationError(err.message || 'Đăng ký thất bại'));
      setModalContent('Đăng ký thất bại!');
      setShowModal(true);
      setIsQRModal(false);
      console.error('Lỗi khi gọi handleAction:', err);
    }
  };

  const handleModalDismiss = () => {
    setShowModal(false);
    if (isQRModal) {
      setShowSuccessPopup(true);
      setIsQRModal(false);
    }
  };

  const renderKeyValueList = (data: Record<string, any>) => (
    <IonCard className="custom-card">
      <IonCardHeader>
        <IonCardTitle>Thông tin đăng ký</IonCardTitle>
      </IonCardHeader>
      <IonCardContent>
        <IonGrid>
          {Object.entries(data).map(([key, value]) => {
            let label = key;
            let displayValue = value;
            for (const section of publicMenu?.data?.filter((item: any) => item.title !== 'Đăng ký khám') || []) {
              const found = section.controlForm?.find((ctrl: any) => ctrl.mapfield === key);
              if (found) {
                label = found.key || key;
                if (found.dataSourceApi && selectOptions[key]) {
                  const opt = selectOptions[key].find(opt => opt.value === value);
                  if (opt) displayValue = opt.label;
                }
                break;
              }
            }

            return (
              <IonRow key={key} className="ion-align-items-center ion-padding-vertical">
                <IonCol size="5">
                  <IonText color="medium"><strong>{label}</strong></IonText>
                </IonCol>
                <IonCol size="7">
                  <IonText color={displayValue ? 'dark' : 'danger'}>
                    {displayValue !== null && displayValue !== undefined && displayValue !== '' ? String(displayValue) : '[trống]'}
                  </IonText>
                </IonCol>
              </IonRow>
            );
          })}
        </IonGrid>
      </IonCardContent>
    </IonCard>
  );

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Đăng ký khám</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent>
        {viewRequestBody && renderKeyValueList(viewRequestBody)}

        <DinamicForm
          controls={controlForms}
          onFormChange={() => { }}
          activeTab={activeTab}
          onButtonClick={handleAction}
        />
        <IonModal isOpen={showModal} onDidDismiss={handleModalDismiss} className="success-modal ion-no-padding">
          <div className="custom-qr-modal">
            {modalContent}
            <IonButton onClick={() => setShowModal(false)}>Đóng</IonButton>
          </div>
        </IonModal>
        <IonModal isOpen={showSuccessPopup} onDidDismiss={() => setShowSuccessPopup(false)} className="success-modal ion-no-padding">
          <div className="success-container">
            <div className="success-icon">✅</div>
            <h3 className="success-title">Đăng ký thành công!</h3>
            <p className="success-message">
              Bạn đã đăng ký khám bệnh thành công.<br />
              Vui lòng kiểm tra email hoặc tin nhắn để biết thêm chi tiết.
            </p>
            <IonButton className='btn-close' expand="block" color="primary" onClick={() => setShowSuccessPopup(false)}>
              Đóng
            </IonButton>
          </div>
        </IonModal>
      </IonContent>
    </IonPage>
  );
};

export default RegisterPage;

