import {
    IonBackButton,
    IonButtons,
    IonContent,
    IonHeader,
    IonIcon,
    IonInput,
    IonPage,
    IonToolbar
  } from '@ionic/react';
  import { filterOutline, searchOutline } from 'ionicons/icons';
  import React, { useState, useCallback, useEffect } from 'react';
  import { useTranslation } from 'react-i18next';
  import { useHistory } from 'react-router-dom';
  import { Storage } from '@capacitor/storage';
  import { useTVGDControlData } from '../../utils/hooks/useControlData';
  import DynamicForm from '../../components/dinamicForm/DinamicForm';
  import axiosInstance from '../../utils/functions/axios';
  import './FamilyPage.css';
  
  const FamilyPage: React.FC = () => {
    const { t } = useTranslation();
    const history = useHistory();
    const [searchInputValue, setSearchInputValue] = useState('');
    const [formData, setFormData] = useState<any>({});
    const [patientData, setPatientData] = useState<any[]>([]);
    const [loadingPatientData, setLoadingPatientData] = useState(false);

    const { controlData, loading, error, refetch } = useTVGDControlData();

    // Handle auth error
    const handleAuthError = useCallback(async () => {
      try {
        await Storage.clear();
        history.replace('/login');
      } catch {
        history.replace('/login');
      }
    }, [history]);

    // Fetch patient data
    const fetchPatientData = useCallback(async (page = 1, pageSize = 10) => {
      setLoadingPatientData(true);
      try {
        const requestBody: any = {
          listname: 'TVGD',
          page: page,
          pageSize: pageSize
        };
        
        const userResult = await Storage.get({ key: 'auth_user' });
        const userData = userResult.value ? JSON.parse(userResult.value) : null;

        if (userData?.id) {
          // requestBody.dk = requestBody.dk.replace('MaBN:', `MaBN:${userData.id}`);
          requestBody.dk = `MaBN:02000456`; 
        }

        console.log('Fetching patient data with body:', requestBody);
        
        const response = await axiosInstance.post('/MedyxAPI/BenhNhan/GetList', requestBody);
        
        console.log('Patient data response:', response.data);
        
        // Xử lý data từ API response
        const rawData = response.data?.data || [];
        setPatientData(rawData);

      } catch (err: any) {
        console.error('Error fetching patient data:', err);
        if (err.response?.status === 401 || err.response?.status === 403) {
          handleAuthError();
          return;
        }
        console.error('Không thể tải dữ liệu bệnh nhân');
      } finally {
        setLoadingPatientData(false);
      }
    }, [handleAuthError]);

    // Load data khi component mount
    useEffect(() => {
      if (controlData) {
        fetchPatientData();
      }
    }, [controlData, fetchPatientData]);

    const handleSearch = async (value: string) => {
      setSearchInputValue(value);
    };

    const handleFormChange = (data: any) => {
      setFormData(data);
      console.log('Form data changed:', data);
    };

    const handleRefresh = () => {
      refetch();
      fetchPatientData();
    };

    // Convert patientData thành initialValues cho DynamicForm
    const getInitialValues = () => {
      const initialValues: any = {};
      
      if (patientData.length > 0 && patientData[0].patientData) {
        patientData[0].patientData.forEach((field: any) => {
          initialValues[field.mapfield] = field.value || '';
        });
      }
      
      return initialValues;
    };

    // Lấy controls từ controlData
    const getFamilyControls = () => {
      if (!controlData?.controlForm) return [];
      
      // Tìm group có title "Danh sách khoa" hoặc group đầu tiên
      const familyGroup = (controlData.controlForm as any[]).find((group: any) =>
        group.title === "Danh sách khoa" || group.controlForm
      );
      if (familyGroup?.controlForm) {
        return familyGroup.controlForm;
      }
      
      // Fallback: nếu không có group, trả về tất cả controls
      return controlData.controlForm;
    };

    return (
      <IonPage>
        <IonHeader className='ion-home-header_family'>
          <IonToolbar className="tool-bar-header custom-toolbar">
            <div className="toolbar-flex">
              <div className="toolbar-side">
                <IonButtons slot="start">
                  <IonBackButton defaultHref="/" />
                </IonButtons>
              </div>
              <div className="toolbar-center">Thông tin gia đình</div>
              <div className="toolbar-side" />
            </div>
          </IonToolbar>
        </IonHeader>

        <IonContent>
          <div className="page-content">
            {(loading || loadingPatientData) && (
              <div className="loading-container">
                <div className="loading-spinner"></div>
                <span className="loading-text">
                  {loading ? 'Đang tải cấu hình...' : 'Đang tải dữ liệu bệnh nhân...'}
                </span>
              </div>
            )}

            {error && (
              <div className="error-container">
                <div className="error-title">Lỗi:</div>
                <div className="error-message">{error}</div>
                <button onClick={handleRefresh} className="retry-button">Thử lại</button>
              </div>
            )}

            {!loading && !loadingPatientData && controlData && (
              <div>
                {/* Family Information Form */}
                <div className="family-form-section">
                  <div className="section-header">
                    <h3>Thông tin gia đình</h3>
                  </div>
                  
                  <DynamicForm
                    controls={getFamilyControls()}
                    onFormChange={handleFormChange}
                    initialValues={getInitialValues()}
                  />
                </div>
              </div>
            )}
          </div>
        </IonContent>
      </IonPage>
    );
  };
  
  export default FamilyPage;