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
  import React, { useState } from 'react';
  import { useTranslation } from 'react-i18next';
  import { useDSPKControlData } from '../../utils/hooks/useControlData';
  import DynamicForm from '../../components/dinamicForm/DinamicForm';
  import DynamicDisplayForm from '../../components/dinamicForm/DynamicDisplayForm';
  import './AppointmentCheckPage.css';
  
  const AppointmentCheckPage: React.FC = () => {
    const { t } = useTranslation();
    const [searchInputValue, setSearchInputValue] = useState('');
    const [formData, setFormData] = useState<any>({});
  
    const { controlData, loading, error, refetch } = useDSPKControlData();
  
    const handleSearch = async (value: string) => {
      setSearchInputValue(value);
    };
  
    const handleFormChange = (data: any) => {
      setFormData(data);
      console.log('Form data changed:', data);
    };
  
    const handleRefresh = () => {
      refetch();
    };
  
    return (
      <IonPage>
        <IonHeader className='ion-home-header_appointment'>
          <IonToolbar className="tool-bar-header custom-toolbar">
            <div className="toolbar-flex">
              <div className="toolbar-side">
                <IonButtons slot="start">
                  <IonBackButton defaultHref="/" />
                </IonButtons>
              </div>
              <div className="toolbar-center">Danh sách số khám</div>
              <div className="toolbar-side" />
            </div>
            <div className="ion-search-header">
              <IonIcon icon={searchOutline} className="search-icon" />
              <IonInput
                placeholder={t('search_placeholder')}
                className="search-input"
                type="text"
                value={searchInputValue}
                onIonInput={(e) => handleSearch(e.detail.value || '')}
              />
              <div className="search-actions">
                <IonIcon
                  icon={filterOutline}
                  className="action-icon"
                  onClick={() => {}}
                />
              </div>
            </div>
          </IonToolbar>
        </IonHeader>
  
        <IonContent>
          <div className="page-content">
            {loading && (
              <div className="loading-container">
                <div className="loading-spinner"></div>
                <span className="loading-text">Đang tải dữ liệu...</span>
              </div>
            )}
  
            {error && (
              <div className="error-container">
                <div className="error-title">Lỗi:</div>
                <div className="error-message">{error}</div>
                <button onClick={handleRefresh} className="retry-button">Thử lại</button>
              </div>
            )}
  
            {!loading && !error && controlData && (
              <div>
                {(() => {
                  const subControlFields = controlData.controlForm
                    .filter(ctrl => ctrl.controlType === 'GRID')
                    .flatMap(grid => {
                      try {
                        return JSON.parse(grid.subControl || '[]');
                      } catch {
                        return [];
                      }
                    });
                  return (
                    <DynamicForm
                      controls={controlData.controlForm.filter(
                        ctrl =>
                          ctrl.controlType !== 'GRID' &&
                          !subControlFields.includes(ctrl.mapfield)
                      )}
                      onFormChange={handleFormChange}
                      initialValues={{}}
                    />
                  );
                })()}
                {controlData.controlForm
                  .filter(ctrl => ctrl.controlType === 'GRID')
                  .map((gridControl, index) => {
                    let subFields: string[] = [];
                    try {
                      subFields = JSON.parse(gridControl.subControl || '[]');
                    } catch {}
  
                    const subControls = controlData.controlForm.filter(c =>
                      subFields.includes(c.mapfield)
                    );
  
                    return (
                      <DynamicDisplayForm
                        key={`grid-${index}`}
                        controls={[{ ...gridControl, subControls }]}
                      />
                    );
                  })}
                {Object.keys(formData).length > 0 && (
                  <div className="form-data-container">
                    <h4 className="form-data-title">Dữ liệu đã chọn:</h4>
                    <div className="form-data-content">
                      <pre className="form-data-json">
                        {JSON.stringify(formData, null, 2)}
                      </pre>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </IonContent>
      </IonPage>
    );
  };
  
  export default AppointmentCheckPage;
  