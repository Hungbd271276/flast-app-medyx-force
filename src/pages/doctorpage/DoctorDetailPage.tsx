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
  IonSpinner
} from '@ionic/react';
import { chevronForwardOutline, chevronBackOutline } from 'ionicons/icons';
import DinamicForm from '../../components/dinamicForm/DinamicForm';
import Loading from '../../components/loadding/Loading';
import ErrorMessage from '../../components/loadding/ErrorMessage';
import { useTranslation } from 'react-i18next';
import './DoctorDetailPage.css';

const DoctorDetailPage: React.FC = () => {
  const dispatch = useDispatch();
  const history = useHistory();
const location = useLocation<{ doctorData?: any }>();
  const { t } = useTranslation();
  
  const doctorData = location.state?.doctorData;

  const publicMenu = useSelector(state => state.booking.publicMenu);
  const loading = useSelector(state => state.booking.loading);
  const error = useSelector(state => state.booking.error);

  const [localFormData, setLocalFormData] = useState<Record<string, any>>({});
  const [localDefaultValues, setLocalDefaultValues] = useState<Record<string, string>>({});
  const [isFormValid, setIsFormValid] = useState(true);

  useEffect(() => {
    if (!doctorData) {
      history.replace('/doctor');
    }
  }, [doctorData, history]);

  useEffect(() => {
    if (doctorData) {
      dispatch(fetchPublicFormInfo('19002N'));
    }
  }, [dispatch, doctorData]);

  useEffect(() => {
    if (doctorData && doctorData.patientData) {
      const doctorDefaultValues: Record<string, string> = {};
      
      doctorData.patientData.forEach((field: any) => {
        if (field.mapfield && field.value !== null && field.value !== undefined) {
          if (field.type === 'boolean') {
            doctorDefaultValues[field.mapfield] = field.value ? 'true' : 'false';
          } else if (field.type === 'string' || field.type === 'null') {
            doctorDefaultValues[field.mapfield] = field.value || '';
          } else {
            doctorDefaultValues[field.mapfield] = String(field.value);
          }
        }
      });

      setLocalDefaultValues(doctorDefaultValues);
    }
  }, [doctorData]);

  const handleFormChange = useCallback((formData: Record<string, any>) => {
    setLocalFormData(formData);
  }, []);

  

  const controlForms = useMemo(() => {
    const allControls = publicMenu?.data?.find(item => item.orderId === 1)?.controlForm || [];
    return allControls.filter((control: any) => 
      control.controlType !== 'GRID' && 
      // control.controlType !== 'Button' &&
      control.controlType !== 'FileView'
    );
  }, [publicMenu]);

  const handleAction = async (mapfield?: string) => {
    try {
      const control = controlForms.find((ctrl: any) => ctrl.mapfield === mapfield);
      if (!control) return;
      
      const { dataSourceApi, body, formRelay } = control;
      console.log('control', control);
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
        ...(doctorData?.additionalData || {})
      };
      requestBody = processRequestBody(requestBody);
      requestBody = Object.fromEntries(
        Object.entries(requestBody).map(([key, value]) => [key, value === null ? "" : value])
      );
      const res = await axiosInstance.post(dataSourceApi, requestBody);
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
        console.log('Kết quả API:', res.data);
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
    if (!doctorData) {
      return <ErrorMessage message="Không có dữ liệu bác sĩ" />;
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
      <div className="doctor-detail-content">
        {controlForms.length > 0 && (
          <IonCard className="doctor-form-card">
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


  if (!doctorData) {
    return (
      <IonPage>
        <IonHeader className='ion-home-header_doctor_detail'>
          <IonToolbar className="tool-bar-header custom-toolbar">
            <div className="toolbar-flex">
              <div className="toolbar-side">
                <IonButtons slot="start">
                  <IonBackButton defaultHref="/doctor" />
                </IonButtons>
              </div>
              <div className="toolbar-center">Chi tiết bác sĩ</div>
              <div className="toolbar-side" />
            </div>
          </IonToolbar>
        </IonHeader>
        <IonContent>
          <div className='doctor-detail-container'>
            <Loading message="Đang chuyển hướng..." />
          </div>
        </IonContent>
      </IonPage>
    );
  }

  return (
    <IonPage>
      <IonHeader className='ion-home-header_doctor_detail'>
        <IonToolbar className="tool-bar-header custom-toolbar">
          <div className="toolbar-flex">
            <div className="toolbar-side">
              <IonButtons slot="start">
                <IonBackButton defaultHref="/doctor" />
              </IonButtons>
            </div>
            <div className="toolbar-center">Chi tiết bác sĩ</div>
            <div className="toolbar-side" />
          </div>
        </IonToolbar>
      </IonHeader>
      
      <IonContent>
        <div className='doctor-detail-container'>
          {renderContent()}
        </div>
      </IonContent>
    </IonPage>
  );
};

export default DoctorDetailPage;
