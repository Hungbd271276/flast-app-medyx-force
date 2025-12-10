import React, { useState, useEffect, useCallback } from 'react';
import {
  IonText,
  IonButton,
  IonCard,
  IonCardContent,
  IonIcon,
  IonSpinner,
} from '@ionic/react';
import {
  documentTextOutline,
  chevronForwardOutline,
  chevronBackOutline
} from 'ionicons/icons';
import { useHistory } from 'react-router-dom';
import { Storage } from '@capacitor/storage';
import axiosInstance from '../../utils/functions/axios';
import './DynamicDisplayForm.css';

interface ControlItem {
  key: string;
  controlType: string;
  mapfield: string;
  validate?: string;
  validateTrigger?: string;
  formRelay?: string;
  dataSourceApi?: string;
  radioOptions?: { id: string; value: string }[];
  subControls?: ControlItem[];
  [key: string]: any;
}

interface DynamicDisplayFormProps {
  controls: ControlItem[];
  defaultValues?: Record<string, string>;
  initialValues?: { [field: string]: any };
  onButtonClick?: (field: string) => void;
}

const DynamicDisplayForm: React.FC<DynamicDisplayFormProps> = React.memo(({ 
  controls, 
  initialValues = {}, 
  defaultValues = null, 
  onButtonClick 
}) => {
  const history = useHistory();
  const [formValues, setFormValues] = useState<{ [field: string]: any }>({
    ...initialValues,
    ...defaultValues,
  });
  const [selectOptions, setSelectOptions] = useState<{ [key: string]: any[] }>({});

  useEffect(() => {
    setFormValues(prev => ({
      ...prev,
      ...defaultValues,
    }));
  }, [defaultValues]);

  const fetchSelectOptions = useCallback((item: ControlItem, currentValues: { [key: string]: any } = formValues) => {
    let requestBody = item.body ? JSON.parse(item.body) : {};

    try {
      if (item.formRelay) {
        const relayFields: string[] = Array.isArray(item.formRelay)
          ? item.formRelay
          : JSON.parse(item.formRelay);

        const dkList: string[] = [];

        relayFields.forEach(relayKey => {
          const matchedControl = controls.find(c => c.key === relayKey);
          if (matchedControl) {
            const field = matchedControl.mapfield;
            const value = currentValues[field];
            if (value) {
              dkList.push(`${field}:${value}`);
            }
          }
        });

        if (dkList.length > 0) {
          requestBody.dk = dkList.join(';');
        }
      }
    } catch { }

    axiosInstance.post(item.dataSourceApi!, requestBody)
      .then(res => {
        const rawData = res.data.newsList || [];
        const processedOptions = rawData
          .filter((item: any) => item.id)
          .map((item: any) => ({ value: item.id, label: item.name }));
        setSelectOptions(prev => ({ ...prev, [item.mapfield]: processedOptions }));
      })
      .catch(() => {
        setSelectOptions(prev => ({ ...prev, [item.mapfield]: [] }));
      });
  }, [controls, formValues]);

  useEffect(() => {
    controls.forEach(item => {
      if (
        item.controlType.toUpperCase() === 'SELECT' &&
        item.dataSourceApi
      ) {
        let relayKeys: string[] = [];
        let hasRelay = false;
        if (item.formRelay && item.formRelay !== '' && item.formRelay !== '[]') {
          hasRelay = true;
          try {
            relayKeys = JSON.parse(item.formRelay);
          } catch {
            relayKeys = [item.formRelay];
          }
        }

        if (hasRelay) {
          const allRelayFilled = relayKeys.every(relayKey => !!formValues[relayKey]);
          if (!allRelayFilled) {
            return;
          }
        }

        if (selectOptions[item.mapfield]) return;

        let body = item.body ? JSON.parse(item.body) : {};

        if (hasRelay && relayKeys.length > 0) {
          const relayPairs = relayKeys
            .map(relayKey => {
              const relayValue = formValues[relayKey];
              if (relayValue) {
                return `${relayKey}:${relayValue}`;
              }
              return null;
            })
            .filter(Boolean);

          if (relayPairs.length > 0) {
            body.dk = relayPairs.join(';');
          }
        }
        axiosInstance
          .post(item.dataSourceApi, body)
          .then(res => {
            const rawData = res.data.newsList || [];
            const processedOptions = rawData.map((item: any) => ({
              value: item.id || '',
              label: item.name || ''
            })).filter((option: { value: string; label: string }) => option.value && option.label);

            setSelectOptions(prev => ({
              ...prev,
              [item.mapfield]: processedOptions,
            }));
          })
          .catch((error) => {
            console.error('Error fetching select options:', error);
            setSelectOptions(prev => ({
              ...prev,
              [item.mapfield]: [],
            }));
          });
      }
    });
  }, [controls, formValues]);

  const formatDisplayValue = (item: ControlItem, value: any) => {
    if (value === null || value === undefined || value === '') {
      return 'N/A';
    }

    switch (item.controlType.toUpperCase()) {
      case 'SELECT':
        const option = selectOptions[item.mapfield]?.find(opt => opt.value === value);
        return option ? option.label : value;
      
      case 'DATETIMEPICKER':
        try {
          const date = new Date(value);
          return date.toLocaleDateString('vi-VN');
        } catch {
          return value;
        }
      
      case 'RADIO':
        const radioOption = item.radioOptions?.find(opt => opt.id === value);
        return radioOption ? radioOption.value : value;
      
      default:
        return String(value);
    }
  };

  const renderControl = (item: ControlItem) => {
    const label = item.key;

    switch (item.controlType.toUpperCase()) {
      case 'TEXTBOX':
      case 'SELECT':
      case 'DATETIMEPICKER':
      case 'RADIO':
        return (
          <div className="display-item-dinamic">
            <div className="display-label">{label}:</div>
            <div className="display-value">{formatDisplayValue(item, formValues[item.mapfield])}</div>
          </div>
        );

      case 'CAMERA':
        return (
          <div className="display-item-dinamic">
            <div className="display-label">{label}:</div>
            <div className="display-value">
              {formValues[item.mapfield] ? 'Đã tải lên' : 'Chưa tải lên'}
            </div>
          </div>
        );

      case 'BUTTON':
        return (
          <div className="display-item-dinamic">
            <div className="button-container">
              <IonButton 
                className='button-dinamic'
                onClick={() => {
                  if (onButtonClick) {
                    onButtonClick(item.mapfield);
                  }
                }}
              >
                {label}
              </IonButton>
            </div>
          </div>
        );

      case 'FILEVIEW':
        return (
          <div className="display-item-dinamic">
            <div className="display-label">{label}:</div>
            <div className="display-value">
              <IonButton
                fill="outline"
                size="small"
                onClick={async () => {
                  if (item.dataSourceApi && item.body) {
                    try {
                      // Parse base body
                      let baseBody = {};
                      if (item.body && typeof item.body === 'string' && item.body.trim() !== '') {
                        try {
                          baseBody = JSON.parse(item.body.replace(/:\s*(?=,|})/g, ': null'));
                        } catch (err) {
                          console.error('Lỗi parse body:', item.body, err);
                          baseBody = {};
                        }
                      }

                      // Handle formRelay if exists
                      let fields: string[] = [];
                      if (item.formRelay && typeof item.formRelay === 'string' && item.formRelay.trim() !== '') {
                        try {
                          fields = JSON.parse(item.formRelay);
                        } catch (err) {
                          console.error('Lỗi parse formRelay:', item.formRelay, err);
                          fields = [];
                        }
                      }

                      // Create fieldData from formRelay
                      const fieldData = Object.fromEntries(
                        fields.map((f: string) => {
                          const value = formValues[f] ?? '';
                          return [
                            f,
                            typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)
                              ? new Date(value).toLocaleDateString('vi-VN')
                              : value
                          ];
                        })
                      );

                      let requestBody: { [key: string]: any } = {
                        ...baseBody,
                        ...fieldData,
                        ...formValues
                      };

                      // Remove null values
                      requestBody = Object.fromEntries(
                        Object.entries(requestBody).map(([key, value]) => [key, value === null ? "" : value])
                      );

                      // Xử lý logic nối giá trị vào dk nếu có key trùng
                      if (requestBody.dk && typeof requestBody.dk === 'string') {
                        const dkValue = requestBody.dk;
                        const keysToRemove: string[] = [];
                        
                        // Tìm các key có giá trị trùng với pattern trong dk
                        Object.entries(requestBody).forEach(([key, value]) => {
                          if (key !== 'dk' && typeof value === 'string' && value.trim() !== '') {
                            // Kiểm tra xem key có xuất hiện trong dk không
                            // Ví dụ: dk = "iD_DANG_KY:" thì tìm key "iD_DANG_KY"
                            const dkPattern = dkValue.replace(/:/g, ''); // Loại bỏ dấu : để so sánh
                            if (key === dkPattern) {
                              // Nối giá trị vào dk
                              requestBody.dk = `${dkValue}${value}`;
                              keysToRemove.push(key);
                            }
                          }
                        });
                        
                        // Xóa các key đã được nối vào dk
                        keysToRemove.forEach(key => {
                          delete requestBody[key];
                        });
                      }

                      const response = await axiosInstance.post(item.dataSourceApi, requestBody);
                      
                      // Handle PDF response
                      const pdfArray = Array.isArray(response.data?.data) ? response.data.data : null;
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
                      } else if (response.data.url) {
                        // Fallback to direct URL
                        try {
                          const { InAppBrowser } = await import('@awesome-cordova-plugins/in-app-browser');
                          InAppBrowser.create(response.data.url, '_system', {
                            location: 'yes',
                            toolbar: 'yes'
                          });
                        } catch (error) {
                          window.open(response.data.url, '_blank');
                        }
                      } else {
                        console.log('Kết quả API:', response.data);
                      }

                    } catch (error) {
                      console.error('Error fetching file:', error);
                    }
                  }
                }}
              >
                <IonIcon icon={documentTextOutline} slot="start" />
                Xem {label}
              </IonButton>
            </div>
          </div>
        );

      case 'GRID': {
        const [gridData, setGridData] = useState<any[]>([]);
        const [loading, setLoading] = useState(false);
        const [error, setError] = useState<string>('');
        const [currentPage, setCurrentPage] = useState(1);
        const [totalItems, setTotalItems] = useState(0);
        const [itemsPerPage, setItemsPerPage] = useState(10);

        const handleAuthError = useCallback(async () => {
          try {
            await Storage.clear();
            history.replace('/login');
          } catch {
            history.replace('/login');
          }
        }, [history]);

        const fetchGridData = useCallback(async (page = 1) => {
          if (!item.dataSourceApi) return;
          setLoading(true);
          setError('');
          try {
            const requestBody = item.body ? JSON.parse(item.body) : {};
            const userResult = await Storage.get({ key: 'auth_user' });
            const userData = userResult.value ? JSON.parse(userResult.value) : null;

            if (requestBody.dk?.includes('MaBN:')) {
              if (userData?.id) {
                // requestBody.dk = requestBody.dk.replace('MaBN:', `MaBN:${userData.id}`);
                 requestBody.dk = requestBody.dk.replace('MaBN:', `MaBN:02000456`);
              }
            }
            requestBody.page = page;
            requestBody.pageSize = itemsPerPage;
            const response = await axiosInstance.post(item.dataSourceApi, requestBody);
            const data = response.data?.data || response.data?.newsList || response.data || [];
            setGridData(data);
            setTotalItems(response.data?.totalRow || 0);
            setCurrentPage(page);
          } catch (err: any) {
            if (err.response?.status === 401 || err.response?.status === 403) {
              handleAuthError();
              return;
            }
            setError('Không thể tải dữ liệu');
          } finally {
            setLoading(false);
          }
        }, [item.dataSourceApi, item.body, handleAuthError, itemsPerPage]);

        useEffect(() => {
          fetchGridData(1);
        }, [fetchGridData]);

        const handlePageChange = (page: number) => {
          fetchGridData(page);
        };

        const renderPagination = () => {
          const totalPages = Math.ceil(totalItems / itemsPerPage);
          if (totalPages <= 1) return null;
          
          const getPageNumbers = () => {
            const pages = [];
            const maxVisiblePages = 5;
            if (totalPages <= maxVisiblePages) {
              for (let i = 1; i <= totalPages; i++) {
                pages.push(i);
              }
            } else {
              if (currentPage <= 3) {
                for (let i = 1; i <= 4; i++) {
                  pages.push(i);
                }
                pages.push('...');
                pages.push(totalPages);
              } else if (currentPage >= totalPages - 2) {
                pages.push(1);
                pages.push('...');
                for (let i = totalPages - 3; i <= totalPages; i++) {
                  pages.push(i);
                }
              } else {
                pages.push(1);
                pages.push('...');
                for (let i = currentPage - 1; i <= currentPage + 1; i++) {
                  pages.push(i);
                }
                pages.push('...');
                pages.push(totalPages);
              }
            }
            return pages;
          };

          const pageNumbers = getPageNumbers();
          return (
            <div className="pagination-container-grid">
              <div className="pagination-info">
                Hiển thị {((currentPage - 1) * itemsPerPage) + 1} - {Math.min(currentPage * itemsPerPage, totalItems)} của {totalItems} mục
              </div>

              <div className="pagination-controls">
                <IonButton
                  fill="clear"
                  disabled={currentPage === 1}
                  onClick={() => handlePageChange(currentPage - 1)}
                  className="pagination-btn"
                >
                  <IonIcon icon={chevronBackOutline} />
                </IonButton>
                {pageNumbers.map((page, index) => (
                  <IonButton
                    key={index}
                    fill={page === currentPage ? "solid" : "clear"}
                    onClick={() => typeof page === 'number' ? handlePageChange(page) : null}
                    disabled={page === '...'}
                    className={`pagination-btn ${page === currentPage ? 'active' : ''}`}
                  >
                    {page}
                  </IonButton>
                ))}
                <IonButton
                  fill="clear"
                  disabled={currentPage === totalPages}
                  onClick={() => handlePageChange(currentPage + 1)}
                  className="pagination-btn"
                >
                  <IonIcon icon={chevronForwardOutline} />
                </IonButton>
              </div>
            </div>
          );
        };

        return (
          <div className="display-item-dinamic-grid grid-container">
            {loading && (
              <div className="grid-loading">
                <IonSpinner name="crescent" />
                <span>Đang tải dữ liệu...</span>
              </div>
            )}

            {error && (
              <div className="grid-error">
                <IonText color="danger">
                  <small>{error}</small>
                </IonText>
              </div>
            )}

            {!loading && !error && gridData.length === 0 && (
              <div className="grid-empty">
                <IonText color="medium">
                  <small>Không có dữ liệu</small>
                </IonText>
              </div>
            )}

            {!loading && !error && gridData.length > 0 && (
              <>
                <div className="grid-list">
                  {gridData.map((row, index) => {
                    const defaultValues: Record<string, string> = {};

                    row.patientData?.forEach((field: any) => {
                      if (field.mapfield && field.value !== null && field.value !== undefined) {
                        if (field.type === 'boolean') {
                          defaultValues[field.mapfield] = field.value ? 'true' : 'false';
                        } else if (field.type === 'string' || field.type === 'null') {
                          defaultValues[field.mapfield] = field.value || '';
                        } else {
                          defaultValues[field.mapfield] = String(field.value);
                        }
                      }
                    });

                    let dynamicControls = [];

                    if (item.subControls && item.subControls.length > 0) {
                      dynamicControls = item.subControls.map((subControl: any) => ({
                        ...subControl,
                        defaultValue: defaultValues[subControl.mapfield] || ''
                      }));
                    } else {
                      dynamicControls = row.patientData?.map((patientItem: any) => ({
                        key: patientItem.mapfield || patientItem.key,
                        controlType: 'TEXTBOX',
                        mapfield: patientItem.mapfield || patientItem.key,
                        validate: '',
                        visible: patientItem.visible !== false,
                        enable: patientItem.enable !== false,
                        orders: patientItem.orders || 0
                      })) || [];
                    }

                    return (
                      <IonCard key={index} className="grid-item-card">
                        <IonCardContent>
                          <DynamicDisplayForm
                            controls={dynamicControls}
                            defaultValues={defaultValues}
                            initialValues={defaultValues}
                          />
                        </IonCardContent>
                      </IonCard>
                    );
                  })}
                </div>
                {renderPagination()}
              </>
            )}
          </div>
        );
      }

      default:
        return null;
    }
  };

  return <>{controls.map((item, idx) => <div key={idx}>{renderControl(item)}</div>)}</>;
});

export default DynamicDisplayForm; 