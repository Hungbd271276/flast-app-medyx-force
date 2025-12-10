import React, { useRef, useState, useEffect, useCallback, useMemo } from 'react';
import { IonInput, IonLabel, IonRadioGroup, IonRadio, IonItem, IonText, IonButton, IonModal, IonCard, IonCardContent,IonIcon,IonBadge,IonSpinner, useIonAlert, IonTitle, IonTextarea, IonSelect, IonSelectOption,} from '@ionic/react';
import {documentTextOutline, chevronForwardOutline, chevronBackOutline, cloudDownloadOutline, downloadOutline, cloudUploadOutline } from 'ionicons/icons';
import { useHistory } from 'react-router-dom';
import { Storage } from '@capacitor/storage';
import _ from "lodash";
import { useForm, Controller } from "react-hook-form";

import axiosInstance from '../../utils/functions/axios';
import CustomDatePicker from '../datepiker/CustomDatePiker';
import { ControlItem, DynamicSignIn } from '../../share/DynamicForm';
import { SIGN, SUBFORM, TOMTAT } from '../../share/constraint';
import { downloadPDFiOS, fileToBase64 } from '../../utils/functions';
// import Pagination from '../pagination/Pagination'; // Xóa dòng import Pagination vì không cần
import { useDispatch, useSelector } from '../../utils/redux/hooks';
import { setListForm } from '../../utils/redux/reducer/dynamicForm';
import './DinamicForm.css';
interface DynamicFormProps {
  controls: ControlItem[];
  activeTab?: string;
  onFormChange?: (formData: { [field: string]: any }) => void;
  defaultValues?: Record<string, string>;
  initialValues?: { [field: string]: any };
  onValidityChange?: (isValid: boolean) => void;
  onButtonClick?: (field: string) => void;
}

const DynamicForm: React.FC<DynamicFormProps> = React.memo(
  ({ controls, activeTab, onFormChange, initialValues = {}, defaultValues = null, onValidityChange, onButtonClick }) => {
  const history = useHistory();
  const dispatch = useDispatch()
  const { control, register, handleSubmit } = useForm<Record<string, any>>({
    defaultValues: {}
  });
  const { listForm } = useSelector(state => state.listFormSign);
  const [errors, setErrors] = useState<{ [field: string]: string }>({});
  const [formValues, setFormValues] = useState<{ [field: string]: any }>({
    ...initialValues,
    ...defaultValues,
  });
  const [selectOptions, setSelectOptions] = useState<{ [key: string]: any[] }>({});
  const [showAlert, setShowAlert] = useState<boolean>(false);
  const [presentAlert, dismissAlert] = useIonAlert();
  const [statusOption, setStatusOption] = useState<any>({"duocKy": false, "fileGoc": "", "fileDaKy": "", "msg": ""})
  const [fullName, setFullName] = useState<string>('');
  const [note, setNote] = useState<string>('')
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [base64Image, setBase64Image] = useState<string>('');
  const [signatute, setSignatute] = useState<string>('');
  const [fileName, setFileName] = useState<string | undefined>('')
  const [selectFileOptions, setSelectFileOptions] = useState([]);

  useEffect(() => {
    setFormValues(prev => ({
      ...prev,
      ...defaultValues,
    }));
  }, [defaultValues]);

  useEffect(() => {
    const handleControl = () => {
      const newErrors: { [field: string]: string } = {};
      controls.forEach(item => {
        const rules = parseRules(item.validate);
        const val = formValues[item.mapfield];
        for (const rule of rules) {
          if (rule.required && (val === '' || val === undefined || val === null)) {
            newErrors[item.mapfield] = rule.message;
            break;
          }
          if (rule.min && typeof val === 'string' && val.length < rule.min) {
            newErrors[item.mapfield] = rule.message;
            break;
          }
          if (rule.max && typeof val === 'string' && val.length > rule.max) {
            newErrors[item.mapfield] = rule.message;
            break;
          }
          if (rule.pattern && typeof val === 'string') {
            try {
              const regex = new RegExp(rule.pattern);
              if (!regex.test(val)) {
                newErrors[item.mapfield] = rule.message;
                break;
              }
            } catch (e) { }
          }
        }
      });
      setErrors(newErrors);
      if (onValidityChange) onValidityChange(Object.values(newErrors).every(e => !e));
    }
    if(controls?.length > 0) {
      handleControl();
    }
  }, [formValues, controls, onValidityChange]);


  useEffect(() => {
    const hasError = Object.values(errors).some(Boolean);
    if (onValidityChange) onValidityChange(!hasError);
  }, [errors, onValidityChange]);

  useEffect(() => {
    const handleControl = () => {
      controls.forEach(item => {
        if ( item.controlType.toUpperCase() === 'SELECT' && item.dataSourceApi) {
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
          // Nếu có relay, chỉ gọi API khi tất cả relayKeys đã có giá trị
          if (hasRelay) {
            const allRelayFilled = relayKeys.every(relayKey => !!formValues[relayKey]);
            if (!allRelayFilled) {
              // Chưa đủ dữ liệu relay, không gọi API
              return;
            }
          }
          // Nếu đã có dữ liệu options rồi thì không gọi lại nữa
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
          axiosInstance.post(item.dataSourceApi, body)
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
    }
    if(controls?.length > 0) {
      handleControl();
    }
  }, [controls, formValues]);

  useEffect(() => {
    const getFormSignatute = async () => {
      const {data} = await axiosInstance.post('https://medyx.flast.vn/MedyxAPI/ControlList/GetPublicMenu?formname=CKSBN', {
        "listname": "DSHSSK",
        "dk": `MaBN:${formValues.MaBN}`,
        "pagesize": 10,
        "pagenumber": 1
      })
      dispatch(setListForm(data.data))
    }
    getFormSignatute()
  },[])

  const parseRules = (validateStr?: string): any[] => {
    if (!validateStr) return [];
    try {
      const cleanedQuotes = validateStr.replace(/\\"/g, '"');
      return JSON.parse(cleanedQuotes);
    } catch (e) {
      console.error("Lỗi khi parse validate string:", e, "Chuỗi gốc:", validateStr);
      return [];
    }
  };

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

  const handleChange = useCallback((
    field: string,
    value: any,
    rules: any[],
    validateTrigger?: string
  ) => {
    const val = value === undefined || value === null ? '' : (typeof value === 'string' ? value : value);

    setFormValues(prev => {
      const newValues = { ...prev, [field]: val };

      if (onFormChange) {
        onFormChange(newValues);
      }

      controls.forEach(item => {
        if (item.controlType.toUpperCase() === 'SELECT' && item.formRelay) {
          try {
            const relayFields: string[] = Array.isArray(item.formRelay) ? item.formRelay : JSON.parse(item.formRelay);
            const matched = relayFields.some(relayKey => {
              const ctrl = controls.find(c => c.key === relayKey);
              return ctrl?.mapfield === field;
            });
            if (matched) {
              fetchSelectOptions(item, newValues);
            }
          } catch (e) {
            console.error("Lỗi xử lý formRelay:", e);
          }
        }
      });
      return newValues;
    });

    if (validateTrigger === 'onChange') {
      let newError = '';
      for (const rule of rules) {
        if (rule.required && (val === '' || val === undefined || val === null)) {
          newError = rule.message;
          break;
        }
        if (rule.min && typeof val === 'string' && val.length < rule.min) {
          newError = rule.message;
          break;
        }
        if (rule.max && typeof val === 'string' && val.length > rule.max) {
          newError = rule.message;
          break;
        }
        if (rule.pattern && typeof val === 'string') {
          try {
            const regex = new RegExp(rule.pattern);
            if (!regex.test(val)) {
              newError = rule.message;
              break;
            }
          } catch (e) {
            console.error("Regex không hợp lệ:", rule.pattern, e);
          }
        }
      }

      setErrors(prevErrors => {
        if (prevErrors[field] !== newError) {
          return { ...prevErrors, [field]: newError };
        }
        return prevErrors;
      });
    }
  }, [controls, onFormChange, fetchSelectOptions]);

  const debounceNote = useCallback(_.debounce((v) => setNote(v), 10),[]);

  const handleCheckSign = async () => { 
    try {
      const param = {
        listname: "CheckSign",
        dk: `MaBN:${formValues?.MaBN};ID:${formValues?.IDGiayTo}`,
        pagesize: 10,
        pagenumber: 1
      }
      const { data } = await axiosInstance.post("/MedyxAPI/BenhNhan/GetPublicList", param);
      const newItem: DynamicSignIn[] = data.data[0]?.patientData || [];
      const duocKy = newItem.find(x => x.mapfield === "DuocKy")?.value;
      const fileGoc = newItem.find(x => x.mapfield === "Filepathgoc")?.value;
      const filepathky = newItem.find(x => x.mapfield === "Filepathky")?.value;
      const msg = newItem.find(x => x.mapfield === "MSS")?.value;
      setStatusOption({ duocKy: duocKy, fileGoc: fileGoc, fileDaKy: filepathky, msg: msg})
      const formKy = controls.find(x => x.mapfield === SIGN);
      if(duocKy) {
        if(!filepathky) {
          presentAlert({
            header: '',
            subHeader: '',
            message: `${msg}`,
            buttons: ['Huỷ'],
          })
          const settimeOut = setTimeout(() => {
            if(formKy?.subForm === SUBFORM) {
              setShowAlert(true);
            }
            dismissAlert();  
          },3000)
          return () => clearTimeout(settimeOut);
        }
      } else {
         presentAlert({
          header: '',
          subHeader: '',
          message: `${msg}`,
          buttons: ['Huỷ'],
        })
        const settimeOut = setTimeout(() => {
          if(formKy?.subForm === SUBFORM) {
            setShowAlert(true);
          }
          dismissAlert();  
        },3000)
        return () => clearTimeout(settimeOut);
      }
    } catch (error) {
      console.log('err', error);
    }
  }
  
  const getSelectFile = async () => {
    try {
      const form: any = listForm[0].controlForm.find(x => x.controlType === 'SELECT');
      const DMFileAction = "DMFileAction";
      let str = form.body;
      str = str.replace("DMFileAction", JSON.stringify(DMFileAction));
      const obj = JSON.parse(str);
      const { data } = await axiosInstance.post(form.dataSourceApi, obj);
      setSelectFileOptions(data?.newsList);
    } catch (error) {
      console.log("Lỗi API:", error);
    }
  }

  useEffect(() => {
    getSelectFile();
  },[listForm])

  
  const renderControl = (item: ControlItem) => {
    const label = item.key;
    const rules = parseRules(item.validate);

    switch (item.controlType.toUpperCase()) {
      case 'TEXTBOX':
        return (
          <div className="form-item-dinamic">
            <IonLabel className="form-label">{label}</IonLabel>

            <IonInput
              value={formValues[item.mapfield] ?? ''}
              className='btn_form'
              placeholder={label}
              onIonChange={e =>
                handleChange(item.mapfield, e.detail.value ?? '', rules, item.validateTrigger)
              }
            />
            {errors[item.mapfield] && (
              <IonText color="danger">
                <small>{errors[item.mapfield]}</small>
              </IonText>
            )}
          </div>
        );

      case 'SELECT':
        const [showModal, setShowModal] = useState(false);
        return (
          <div className="form-item-dinamic">
            <IonLabel className="form-label">{label}</IonLabel>
            <div className={`select-input${!formValues[item.mapfield] ? ' placeholder' : ''}`} onClick={() => setShowModal(true)}>
              {selectOptions[item.mapfield]?.find(opt => opt.value === formValues[item.mapfield])?.label || `Chọn ${label}`}
            </div>
            <IonModal isOpen={showModal} animated={false} onDidDismiss={() => setShowModal(false)} 
                initialBreakpoint={0.5}  // mở ra 50% chiều cao
                breakpoints={[0, 1, 0.9]} // các nấc kéo
                backdropBreakpoint={0.5}
              className="modal-bottom-sheet">
              <div className="modal-content">
                <div className="modal-drag-handle"></div>
                <div className="modal-header">
                  <div className="modal-title">Chọn {label}</div>
                  <button className="modal-close-btn" onClick={() => setShowModal(false)}>✕</button>
                </div>
                <div className="modal-options">
                  {(selectOptions[item.mapfield] || []).map((option, idx) => (
                    <div key={idx} className={`modal-option${formValues[item.mapfield] === option.value ? ' selected' : ''}`} onClick={() => {
                      handleChange(item.mapfield, option.value, rules, item.validateTrigger);
                      setShowModal(false);
                    }}>{option.label}</div>
                  ))}
                </div>
              </div>
            </IonModal>
            {errors[item.mapfield] && <IonText color="danger"><small>{errors[item.mapfield]}</small></IonText>}
          </div>
        );

      case 'DATETIMEPICKER': {
        const [showDatePicker, setShowDatePicker] = useState(false);
        // const datePickerRef = useRef(null); // ref dùng để check click ngoài
        const datePickerRef = useRef<HTMLDivElement | null>(null);
        const selectedDate = formValues[item.mapfield]
          ? new Date(formValues[item.mapfield])
          : null;

        // Ẩn lịch nếu click ngoài
        useEffect(() => {
          function handleClickOutside(event: any) {
            if (
              datePickerRef.current &&
              !datePickerRef.current.contains(event.target)
            ) {
              setShowDatePicker(false);
            }
          }

          if (showDatePicker) {
            document.addEventListener('mousedown', handleClickOutside);
          }

          return () => {
            document.removeEventListener('mousedown', handleClickOutside);
          };
        }, [showDatePicker]);

        return (
          <div className="form-item-dinamic">
            <IonLabel className="form-label">{label}</IonLabel>

            <IonButton
              fill="outline"
              expand="block"
              className='button-radius'
              onClick={() => setShowDatePicker(true)}
            >
              {selectedDate
                ? selectedDate.toLocaleDateString('vi-VN')
                : 'Chọn ngày'}
            </IonButton>

            {showDatePicker && (
              <div ref={datePickerRef}>
                <CustomDatePicker
                  onClose={() => setShowDatePicker(false)}
                  onDateSelect={(date) => {
                    const formattedDate = new Intl.DateTimeFormat('sv-SE').format(date); // YYYY-MM-DD
                    handleChange(
                      item.mapfield,
                      formattedDate,
                      rules,
                      item.validateTrigger
                    );
                    setShowDatePicker(false);
                  }}
                  allowPast={true}
                />
              </div>
            )}

            {errors[item.mapfield] && (
              <IonText color="danger">
                <small>{errors[item.mapfield]}</small>
              </IonText>
            )}
          </div>
        );
      }
      case 'RADIO': {
        // Hàm lấy giá trị ưu tiên
        function getRadioValue() {
          if (formValues[item.mapfield] !== undefined && formValues[item.mapfield] !== '') {
            return formValues[item.mapfield];
          }
          if (defaultValues && defaultValues[item.mapfield] !== undefined && defaultValues[item.mapfield] !== '') {
            return defaultValues[item.mapfield];
          }
          return '';
        }
        // Lấy radioOptions từ props hoặc item
        const options = item.radioOptions || selectOptions[item.mapfield]?.map(opt => ({ id: opt.value, value: opt.label })) || [];
        return (
          <div className="form-item-dinamic">
            <IonLabel className="form-label">{label}</IonLabel>
            <IonRadioGroup
              value={getRadioValue()}
              onIonChange={e =>
                handleChange(item.mapfield, e.detail.value, rules, item.validateTrigger)
              }
            >
              <div className='item-radio-dinamic'>
                {options.map(opt => (
                  <IonItem key={opt.id}>
                    <IonRadio value={opt.id} slot="start" />
                    <IonLabel>{opt.value}</IonLabel>
                  </IonItem>
                ))}
              </div>
            </IonRadioGroup>
            {errors[item.mapfield] && (
              <IonText color="danger">
                <small>{errors[item.mapfield]}</small>
              </IonText>
            )}
          </div>
        );
      }

      case 'CAMERA':
        return (
          <div className="form-item-dinamic">
            <IonLabel className="form-label">{label}</IonLabel>
            <input
              type="file"
              accept="image/*"
              capture="environment"
              onChange={e =>
                handleChange(item.mapfield, e.target.files?.[0], rules, item.validateTrigger)
              }
            />
          </div>
        );
      case 'BUTTON':
        return (
          <div className="form-item-dinamic">
            <div className="button-container">
              <IonButton className='button-dinamic'
                onClick={() => {
                  if(item.mapfield === SIGN) {
                    handleCheckSign();
                  } else if(item.mapfield === TOMTAT) {
                    if (onButtonClick) {
                      onButtonClick(item.mapfield);
                    }
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
          <div className="form-item-dinamic">
            <IonLabel className="form-label">{label}</IonLabel>
            <div className="fileview-container">
              <IonButton
                fill="outline"
                expand="block"
                onClick={() => {
                  if (item.dataSourceApi && item.body) {
                    try {
                      const requestBody = JSON.parse(item.body);
                      axiosInstance.post(item.dataSourceApi, requestBody)
                        .then(response => {
                          if (response.data.url) {
                            window.open(response.data.url, '_blank');
                          }
                        })
                        .catch(error => {
                          console.error('Error fetching file:', error);
                        });
                    } catch (error) {
                      console.error('Error parsing body:', error);
                    }
                  }
                }}
              >
                <IonIcon icon={documentTextOutline} slot="start" />
                Xem {label}
              </IonButton>
              {formValues[item.mapfield] && (
                <div className="fileview-info">
                  <small>File đã được chọn</small>
                </div>
              )}
            </div>
            {errors[item.mapfield] && (
              <IonText color="danger">
                <small>{errors[item.mapfield]}</small>
              </IonText>
            )}
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
        const formatDate = (dateString: string) => {
          if (!dateString) return '';
          try {
            const date = new Date(dateString);
            return date.toLocaleDateString('vi-VN');
          } catch {
            return dateString;
          }
        };

        return (
          <div className="form-item-dinamic grid-container">
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
                          <DynamicForm
                            controls={dynamicControls}
                            defaultValues={defaultValues}
                            initialValues={defaultValues}
                            onFormChange={() => { }}
                            onValidityChange={() => { }}
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
    
  const handleConfirmSign = async (value: any, form: any) => {
    const file = value.FileName;
    const fileName = value.FileName?.name;
    const base64 = await fileToBase64(file);
    setFileName(fileName);  
    try {
      const fixed = form.body.replace(/:\s*(?=,|})/g, ': null');
      let body = JSON.parse(fixed);
      body.MaBN = formValues.MaBN;
      body.ID = formValues.IDGiayTo;
      body.HoTen = value.HoTen;
      body.Filepathgoc = formValues?.Link;
      body.Action = value.Action;
      body.FileName = fileName;
      body.Base64Content = base64;
      body.GhiChu = value.GhiChu;

      const { data } = await axiosInstance.post(form.dataSourceApi, body);
      if(data.data.errorCode === 200) {
        presentAlert({
          header: '',
          subHeader: '',
          message: `${data.data.message}`,
          buttons: ['Huỷ'],
        })
        const newItem: DynamicSignIn[] = data?.data?.data[0]?.patientData || [];
        const duocKy = newItem.find(x => x.mapfield === "DuocKy")?.value;
        const fileGoc = newItem.find(x => x.mapfield === "Filepathgoc")?.value;
        const filepathky = newItem.find(x => x.mapfield === "Filepathky")?.value;
        const msg = newItem.find(x => x.mapfield === "MSS")?.value;
        setStatusOption({ duocKy: duocKy, fileGoc: fileGoc, fileDaKy: filepathky, msg: msg})
        // setShowAlert(false);
      } else {
        presentAlert({
          header: '',
          subHeader: '',
          message: `Cập nhật thất bại`,
        })
      }
    } catch (error) {
      console.log('err', error);
    }
  }

  // Tải file
  const handleDownloadFile = async () => {
    if (!formValues?.Link) return;
    const shortPath = formValues.Link.replace("E:\\TBYTDeployMA\\", "");
    try {
      const response = await axiosInstance.get(`/MedyxAPI/PDF`,
        { params: { path: shortPath }, responseType: "blob" }
      );
      const blob = new Blob([response.data], { type: "application/pdf" });
      downloadPDFiOS(blob, shortPath.split("\\").pop());
    } catch (error) {
      console.error("Download error:", error);
    }
  };

  // View FILE đã ký
  const handleDownloadFileFileView = async () => {

    if (!statusOption.fileDaKy) return;
    const shortPath = statusOption.fileDaKy.replace("E:\\TBYTDeployMA\\", "");
    try {
      const response = await axiosInstance.get(`/MedyxAPI/PDF`,
        { params: { path: shortPath }, responseType: "blob" }
      );
      const blob = new Blob([response.data], { type: "application/pdf" });
      downloadPDFiOS(blob, shortPath.split("\\").pop());
    } catch (error) {
      console.error("Download error:", error);
    }
  }

  const handleOpenFile = () => {
    fileInputRef.current?.click();
  };
   
  // Huỷ file
  const handleHuyFile = async (form: any) => {
    try {
      if(form?.dataSourceApi) {
        const fixed = form.body.replace(/:\s*(?=,|})/g, ': null');
        let obj = JSON.parse(fixed);
        obj.MaBS = formValues.MaBN;
        obj.ID = formValues.IDGiayTo;
        const {data} = await axiosInstance.post(form?.dataSourceApi, obj)
        if(data.code === '000') {
          presentAlert({
            header: '',
            subHeader: '',
            buttons: ['Huỷ'],
            message: `${data.message}`,
          })
          setShowAlert(false);
        } else {
          presentAlert({
            header: '',
            subHeader: '',
            buttons: ['Huỷ'],
            message: `${data.message}`,
          })
        }
      }
    } catch (error) {
      console.log('error');
    }
  }

  return <div className={activeTab === 'register'  ? 'dinamic_bottom' : ''}>
    {controls?.map((item, idx) => <div key={idx}>{renderControl(item)}</div>)}
    <div style={{borderTop: '1px solid #dbdbdb', marginTop: 20}}>
      <IonButton
        expand="block"
        fill="outline"
        className="download-button"
        onClick={handleDownloadFile}
      >
        { <IonIcon icon={cloudDownloadOutline} slot="start" />}
        Tải file
      </IonButton>
    </div>
    <IonModal
      className="sign-modal-small"
      isOpen={showAlert}
      onDidDismiss={() => setShowAlert(false)}
      breakpoints={[0, 0.70]}
      initialBreakpoint={0.70}
    >
      {listForm?.length && listForm.map((item, key) => {
        return (
          <div key={key}>
            <div className="header">
              <h2>{item?.title}</h2>
            </div>

            <div className="content">
              <p style={{color: statusOption.fileDaKy ? '#4caf50' : '#d97706'}}>{statusOption.msg}</p>
            </div>

            <div style={{display: 'flex', justifyContent: 'center', gap: 10}}>
              {statusOption.fileDaKy && (
                item?.controlForm?.map((form, i) => {
                  return (
                    <React.Fragment key={i}>
                      {(() => {
                        if(form.controlType === 'Button') {
                          if(form.mapfield !== "Sign") {
                            return (
                              <div className="extra-actions">
                                <IonButton
                                  expand="block"
                                  fill="outline"
                                  onClick={() => {
                                    if(form.mapfield === "ViewFile") {
                                      handleDownloadFileFileView();
                                    } else if(form.mapfield === "HuyKy") {
                                      handleHuyFile(form)
                                    }
                                  }}
                                >
                                  {form.key}
                                </IonButton>
                              </div>
                            )
                          }
                        }
                      })()}
                  </React.Fragment>
                  )
                })
              )}
            </div>
              {/* File chưa ký */}
              {!statusOption.fileDaKy && (
                item?.controlForm?.map((form, index) => {
                  return (
                    <React.Fragment key={index}>
                      {(() => {
                        // 1) TEXTBOX
                        if (form.controlType === "TEXTBOX" && form.mapfield !== "IDGiayTo") {
                          return (
                            <IonItem>
                              <IonLabel position="stacked" style={{ fontSize: 14, marginBottom: 4 }}>
                                {form.key}
                              </IonLabel>

                              <Controller
                                name={`${form.mapfield}`}
                                control={control}
                                render={({ field }) => (
                                  <IonInput
                                    placeholder={`${form.key}`}
                                    value={field.value || ""}
                                    onIonChange={(e) => field.onChange(e.detail.value)}
                                    onKeyDown={(e) => { if (e.key === "Enter") e.stopPropagation(); }}
                                  />
                                )}
                              />
                            </IonItem>
                          );
                        }

                        // 2) FILE UPLOAD
                        if (form.controlType === "FileUpload") {
                          return (
                            <IonItem>
                              <IonLabel position="stacked" style={{ fontSize: 14, marginBottom: 4 }}>
                                {form.key}
                              </IonLabel>

                              <Controller
                                name={form.mapfield || ''}
                                control={control}
                                render={({ field }) => (
                                  <>
                                    <input
                                      type="file"
                                      hidden
                                      ref={fileInputRef}
                                      onChange={(e) => field.onChange(e.target.files?.[0])}
                                    />

                                    <IonButton expand="block" onClick={handleOpenFile}>
                                      <div style={{ display: "flex", gap: 10, padding: 10 }}>
                                        <IonIcon icon={cloudUploadOutline} slot="start" />
                                        <IonText>Chọn file từ máy</IonText>
                                      </div>
                                    </IonButton>

                                    {field.value && (
                                      <IonText color="medium">
                                        <small>{field.value.name}</small>
                                      </IonText>
                                    )}
                                  </>
                                )}
                              />
                            </IonItem>
                          );
                        }

                        // 3) SELECT
                        if (form.controlType === "SELECT") {
                          return (
                            <IonItem style={{ marginTop: 20 }}>
                              <Controller
                                name={form.mapfield}
                                control={control}
                                render={({ field }) => (
                                  <IonSelect
                                    label="Định dạng File"
                                    labelPlacement="floating"
                                    value={field.value}
                                    onIonChange={(e) => field.onChange(e.detail.value)}
                                  >
                                    {selectFileOptions.map((item: any) => (
                                      <IonSelectOption key={item.id} value={item.id}>
                                        {item.name}
                                      </IonSelectOption>
                                    ))}
                                  </IonSelect>
                                )}
                              />
                            </IonItem>
                          );
                        }

                        // 4) BUTTON
                        if (form.controlType === "Button" && form.mapfield === "Sign") {
                          return (
                            <div className="actions">
                              <IonButton
                                color="primary"
                                className="rounded-btn"
                                onClick={handleSubmit((value) => handleConfirmSign(value, form))}
                              >
                                {form.key}
                              </IonButton>
                            </div>
                          );
                        }

                      })()}
                    </React.Fragment>
                  );
                })
              )}
          </div>
        )
      })}
    </IonModal>

  </div>;
});

export default DynamicForm;