import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useDispatch, useSelector } from '../../utils/redux/hooks';
import { fetchPublicFormInfo } from '../../utils/redux/booking';
import axiosInstance from '../../utils/functions/axios';
import { useLocation, useHistory } from 'react-router-dom';
import {
  IonBackButton, 
  IonButtons, 
  IonHeader, 
  IonPage, 
  IonToolbar, 
  IonContent, 
  IonCard, 
  IonCardContent, 
  IonCardHeader, 
  IonCardTitle, 
  IonText, 
  IonIcon, 
  IonButton,
  IonModal,
  IonSpinner
} from '@ionic/react';
import DinamicForm from '../../components/dinamicForm/DinamicForm';
import Loading from '../../components/loadding/Loading';
import ErrorMessage from '../../components/loadding/ErrorMessage';
import { useTranslation } from 'react-i18next';
import './RecordHealthDetailpage.css';

const RecordHealthDetailpage: React.FC = () => {
  const dispatch = useDispatch();
  const history = useHistory();
  const location = useLocation<{ recordData?: any }>();
  const { t } = useTranslation();
  
  const recordData = location.state?.recordData;

  const publicMenu = useSelector(state => state.booking.publicMenu);
  const loading = useSelector(state => state.booking.loading);
  const error = useSelector(state => state.booking.error);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [localFormData, setLocalFormData] = useState<Record<string, any>>({});
  const [localDefaultValues, setLocalDefaultValues] = useState<Record<string, string>>({});
  const [isFormValid, setIsFormValid] = useState(true);

  useEffect(() => {
    if (!recordData) {
      history.replace('/health-profile');
    }
  }, [recordData, history]);

  useEffect(() => {
    if (recordData) {
      dispatch(fetchPublicFormInfo('DSHSSK'));
    }
  }, [dispatch, recordData]);

  useEffect(() => {
    if (recordData && recordData.patientData) {

      const serviceDefaultValues: Record<string, string> = {};
      
      recordData.patientData.forEach((field: any) => {
        if (field.mapfield && field.value !== null && field.value !== undefined) {
          if (field.type === 'boolean') {
            serviceDefaultValues[field.mapfield] = field.value ? 'true' : 'false';
          } else if (field.type === 'string' || field.type === 'null') {
            serviceDefaultValues[field.mapfield] = field.value || '';
          } else {
            serviceDefaultValues[field.mapfield] = String(field.value);
          }
        }
      });

      setLocalDefaultValues(serviceDefaultValues);
    }
  }, [recordData]);

  const handleFormChange = useCallback((formData: Record<string, any>) => {
    setLocalFormData(formData);
  }, []);

  const controlForms = useMemo(() => {
    const allControls = publicMenu?.data
    ? publicMenu.data.flatMap((item: any) => item.controlForm || [])
    : [];
    return allControls.filter((control: any) => 
      control.controlType !== 'GRID'
    );
  }, [publicMenu]);

  const handleAction = async (mapfield?: string) => {
    try {
      const control = controlForms.find((ctrl: any) => ctrl.mapfield === mapfield);
      if (!control) return;
      const { dataSourceApi, body, formRelay } = control;
      let baseBody = {};
      if (body && typeof body === 'string' && body.trim() !== '') {
        try {
          baseBody = JSON.parse(body.replace(/:\s*(?=,|})/g, ': null'));
        } catch (err) {
          console.error('Lỗi parse body:', body, err);
          baseBody = {};
        }
      } 
      let fields: string[] = [];
      if (formRelay && typeof formRelay === 'string' && formRelay.trim() !== '') {
        try {
          fields = JSON.parse(formRelay);
        } catch (err) {
          console.error('Lỗi parse formRelay:', formRelay, err);
          fields = [];
        }
      }
      const fieldData = Object.fromEntries(
        fields.map((f: string) => {
          const value = localFormData[f] ?? localDefaultValues[f] ?? '';
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
        ...localDefaultValues,
        ...localFormData,
        ...(recordData?.additionalData || {})
      };
      requestBody = processRequestBody(requestBody);
      requestBody = Object.fromEntries(
        Object.entries(requestBody).map(([key, value]) => [key, value === null ? "" : value])
      );
      const res = await axiosInstance.post(dataSourceApi, requestBody);
      const responseMessage = res.data?.message || 
                           res.data?.data?.message || 
                           res.data?.msg || 
                           'Thao tác thành công!';
      const pdfArray = Array.isArray(res.data?.data) ? res.data.data : null;
      const pdfBase64 = pdfArray && typeof pdfArray[0] === 'string' ? pdfArray[0] : null;
      if (pdfBase64) {
        const fullUrl = `${import.meta.env.VITE_API_URL}/MedyxAPI/PDF?Path=${encodeURIComponent(pdfBase64)}`;
        try {
          const { InAppBrowser } = await import('@awesome-cordova-plugins/in-app-browser');
          InAppBrowser.create(fullUrl, '_system', {
            location: 'yes',
            toolbar: 'yes'
          });
        } catch (error) {
          window.open(fullUrl, '_system');
        }
      } else {
        setSuccessMessage(responseMessage);
         setShowSuccessPopup(true);
      }
    } catch (err: any) {
      console.error('Lỗi khi gọi handleAction:', err);
    }
  };

  const formatDate = (value: any) => {
    if (!value) return null;
    const date = new Date(value);
    if (isNaN(date.getTime())) return value;
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}T00:00:00`;
  };

  const processRequestBody = (requestBody: Record<string, any>): Record<string, any> => {
    const processedBody = { ...requestBody };
    Object.keys(processedBody).forEach(key => {
      const value = processedBody[key];
      if (typeof value === 'string' && value.includes(':')) {
        const [fieldName, fieldValue] = value.split(':');
        if (!fieldValue) {
          const localValue = localFormData[fieldName] ?? localDefaultValues[fieldName];
          if (localValue !== null && localValue !== undefined) {
            processedBody[key] = `${fieldName}:${localValue}`;
          }
        }
      }
    });
    return processedBody;
  };

  const renderContent = () => {
    if (!recordData) {
      return <ErrorMessage message="Không có dữ liệu dịch vụ" />;
    }
    if (loading && !controlForms.length) {
      return <Loading message="Đang tải thông tin chi tiết..." />;
    }
    if (error && !controlForms.length) {
      return <ErrorMessage message={`Lỗi: ${error}`} />;
    }
    if (Object.keys(localDefaultValues).length === 0) {
      return <Loading message="Đang xử lý dữ liệu..." />;
    }
    return (
      <div className="service-detail-content">
        {controlForms.length > 0 && (
          <IonCard className="service-form-card">
            <IonCardHeader>
              <IonCardTitle className="form-title">
                Thông tin chi tiết
              </IonCardTitle>
            </IonCardHeader>
            <IonCardContent>
              <DinamicForm
                controls={controlForms}
                defaultValues={localDefaultValues}
                onFormChange={handleFormChange}
                initialValues={localFormData}
                onValidityChange={setIsFormValid}
                onButtonClick={handleAction}
              />
            </IonCardContent>
          </IonCard>
        )}
      </div>
    );
  };

  if (!recordData) {
    return (
      <IonPage>
        <IonHeader className='ion-home-header_detail'>
          <IonToolbar className="tool-bar-header custom-toolbar">
            <div className="toolbar-flex">
              <div className="toolbar-side">
                <IonButtons slot="start">
                  <IonBackButton defaultHref="/health-profile" />
                </IonButtons>
              </div>
              <div className="toolbar-center">Chi tiết hồ sơ sức khỏe</div>
              <div className="toolbar-side" />
            </div>
          </IonToolbar>
        </IonHeader>
        <IonContent>
          <div className='service-detail-container'>
            <Loading message="Đang chuyển hướng..." />
          </div>
        </IonContent>
      </IonPage>
    );
  }

  return (
    <IonPage>
      <IonHeader className='ion-home-header_detail'>
        <IonToolbar className="tool-bar-header custom-toolbar">
          <div className="toolbar-flex">
            <div className="toolbar-side">
              <IonButtons slot="start">
                <IonBackButton defaultHref="/health-profile" />
              </IonButtons>
            </div>
            <div className="toolbar-center">Chi tiết hồ sơ sức khỏe</div>
            <div className="toolbar-side" />
          </div>
        </IonToolbar>
      </IonHeader>
      
      <IonContent>
        <div className='service-detail-container'>
          {renderContent()}
        </div>
      </IonContent>
      <IonModal isOpen={showSuccessPopup} onDidDismiss={() => setShowSuccessPopup(false)} className="success-modal ion-no-padding">
        <div className="success-container">
          <div className="success-icon">✅</div>
          <h3 className="success-title">Thông báo</h3>
          <p className="success-message">
            {successMessage || 'Thao tác đã được thực hiện thành công!'}
          </p>
          <IonButton expand="block" color="primary" onClick={() => setShowSuccessPopup(false)}>
            Đóng
          </IonButton>
        </div>
      </IonModal>
    </IonPage>
  );
};

export default RecordHealthDetailpage;