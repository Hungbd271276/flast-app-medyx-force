import React, { useEffect, useState } from 'react';
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
  IonGrid,
  IonRow,
  IonCol,
  IonText,
  IonIcon,
  IonInput,
  IonButton,
  IonSpinner,
  IonPopover,
  IonSelect,
  IonSelectOption,
  IonLabel
} from '@ionic/react';
import { setDoctors, setDoctorParams, clearDynamicData, callDynamicApi } from '../../utils/redux/doctorSlice';
import { useSelector, useDispatch } from '../../utils/redux/hooks';
import { fetchPublicFormInfo } from '../../utils/redux/booking';
import Loading from '../../components/loadding/Loading';
import ErrorMessage from '../../components/loadding/ErrorMessage';
import { useTranslation } from 'react-i18next';
import EmptyState from '../../components/loadding/EmptyState';
import DinamicForm from '../../components/dinamicForm/DinamicForm';
import './InfoSearchpage.css';
import { micOutline, optionsOutline, filterOutline, searchOutline, chevronForwardOutline, chevronBackOutline, chevronForwardOutline as chevronNextOutline, closeOutline, scanOutline } from 'ionicons/icons';
import { useHistory } from 'react-router-dom';
import axiosInstance from '../../utils/functions/axios';

const InfoSearchPage: React.FC = () => {
  const history = useHistory();
  const dispatch = useDispatch();
  const { t, i18n } = useTranslation();
  const {
    doctors,
    params,
    dynamicData,
    dynamicLoading,
    dynamicError
  } = useSelector((state: any) => state.doctorState);

  // Booking state để lấy thông tin form
  const { publicMenu, loading: formLoading, error: formError } = useSelector((state: any) => state.booking);

  const [currentPage, setCurrentPage] = useState(1);
  const [totalRows, setTotalRows] = useState(0);
  const [currentData, setCurrentData] = useState<any[]>([]);
  const [showFilterPopover, setShowFilterPopover] = useState(false);
  const [filterEvent, setFilterEvent] = useState<any>(null);
  const [filterValues, setFilterValues] = useState<{ [key: string]: string }>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [searchInputValue, setSearchInputValue] = useState('');
  const pageSize = 10;
  const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(null);

  const getFilterableFields = () => {
    if (!publicMenu?.data) return [];

    const allControls = publicMenu.data.find((item: any) => item.orderId === 1)?.controlForm || [];
    const filterControls = allControls.filter((control: any) =>
      control.controlType !== 'GRID' &&
      control.controlType !== 'Button' &&
      control.controlType !== 'FileView' &&
      control.controlType !== 'Label' &&
      control.mapfield
    );

    return filterControls;
  };

  const fetchInfoSearchData = async (pageNumber: number, filters: any = {}, searchValue: string = '') => {
    try {
      let filterConditions = '';
      const filterEntries = Object.entries(filters).filter(([_, value]) => value && value !== '');

      if (filterEntries.length > 0) {
        filterConditions = filterEntries
          .map(([key, value]) => `${key}:${value}`)
          .join(';');
      }
      if (searchValue && searchValue.trim()) {
        if (filterConditions) {
          filterConditions += `;HoTen:${searchValue.trim()}`;
        } else {
          filterConditions = `HoTen:${searchValue.trim()}`;
        }
      }

      const { data } = await axiosInstance.post('/MedyxAPI/NewsList',{},{});
      setCurrentData(data.news || []);

      // const result = await dispatch(callDynamicApi({
      //   endpoint: '/MedyxAPI/BenhNhan/GetPublicList',
      //   body: {
      //     listname: "INFOSEARCH", // Thay đổi listname cho InfoSearch
      //     dk: filterConditions,
      //     pagesize: pageSize,
      //     pagenumber: pageNumber
      //   }
      // })).unwrap();

      // if (result && result.data) {
      //   setCurrentData(result.data);
      //   setTotalRows(result.totalRow || 0);
      // }
    } catch (error) {
      console.error('Error fetching info search data:', error);
    }
  };

  useEffect(() => {
    dispatch(fetchPublicFormInfo('INFOSEARCHN')); // Thay đổi form name cho InfoSearch
  }, [dispatch]);

  useEffect(() => {
    let isMounted = true;

    const loadInitialData = async () => {
      if (isMounted) {
        await fetchInfoSearchData(1, filterValues, searchTerm);
      }
    };

    loadInitialData();

    return () => {
      isMounted = false;
      dispatch(clearDynamicData());
    };
  }, [dispatch]);

  const handlePageChange = async (pageNumber: number) => {
    setCurrentPage(pageNumber);
    await fetchInfoSearchData(pageNumber, filterValues, searchTerm);
  };

  const handleFilterClick = (event: any) => {
    setFilterEvent(event);
    setShowFilterPopover(true);
  };

  const handleFilterFormChange = (formData: { [field: string]: any }) => {
    setFilterValues(formData);
  };

  const handleApplyFilter = async () => {
    setCurrentPage(1);
    await fetchInfoSearchData(1, filterValues, searchTerm);
    setShowFilterPopover(false);
  };

  const handleClearFilter = async () => {
    setFilterValues({});
    setCurrentPage(1);
    await fetchInfoSearchData(1, {}, searchTerm);
    setShowFilterPopover(false);
  };

  const handleSearch = async (value: string) => {
    setSearchInputValue(value);
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }

    const newTimeout = setTimeout(async () => {
      setSearchTerm(value);
      setCurrentPage(1);
      await fetchInfoSearchData(1, filterValues, value);
    }, 1000);

    setSearchTimeout(newTimeout);
  };

  useEffect(() => {
    return () => {
      if (searchTimeout) {
        clearTimeout(searchTimeout);
      }
    };
  }, [searchTimeout]);

  const renderFilterPopover = () => {
    const filterableFields = getFilterableFields();

    return (
      <IonPopover
        isOpen={showFilterPopover}
        event={filterEvent}
        onDidDismiss={() => setShowFilterPopover(false)}
        className="filter-popover"
      >
        <div className="filter-popover-content">
          <div className="filter-header">
            <h3>Bộ lọc tìm kiếm</h3>
            <IonButton
              fill="clear"
              onClick={() => setShowFilterPopover(false)}
              className="close-btn"
            >
              <IonIcon icon={closeOutline} />
            </IonButton>
          </div>

          {filterableFields.length > 0 ? (
            <>
              <div className="filter-form-container">
                <DinamicForm
                  controls={filterableFields}
                  onFormChange={handleFilterFormChange}
                  defaultValues={filterValues}
                  initialValues={filterValues}
                />
              </div>

              <div className="filter-actions">
                <IonButton
                  fill="outline"
                  onClick={handleClearFilter}
                  className="clear-filter-btn"
                >
                  Xóa bộ lọc
                </IonButton>
                <IonButton
                  fill="solid"
                  onClick={handleApplyFilter}
                  className="apply-filter-btn"
                >
                  Áp dụng
                </IonButton>
              </div>
            </>
          ) : (
            <div className="no-filters">
              <p>Không có trường nào có thể lọc</p>
            </div>
          )}
        </div>
      </IonPopover>
    );
  };

  const renderPagination = () => {
    const totalPages = Math.ceil(totalRows / pageSize);
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
      <div className="pagination-container">
        <div className="pagination-info">
          Hiển thị {((currentPage - 1) * pageSize) + 1} - {Math.min(currentPage * pageSize, totalRows)} của {totalRows} kết quả
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
            <IonIcon icon={chevronNextOutline} />
          </IonButton>
        </div>
      </div>
    );
  };

  const handleItemClick = (item: any) => {
    history.push('/info-search-detail', { itemData: item });
  };

  const renderInfoSearchItem = (item: any, index: number) => {
    const visibleFields = item.patientData?.filter((field: any) => field.visible === true) || [];
    const avatarField = visibleFields.find((f: any) => f.mapfield === "avatar" || f.mapfield === "image");
    let avatarUrl = "";
    if (avatarField?.value) {
      if (avatarField.value.startsWith('http')) {
        avatarUrl = avatarField.value;
      } else {
        avatarUrl = `${import.meta.env.VITE_API_URL}/${avatarField.value}`;
      }
    }

    return (
      <IonCard key={index} className="info-search-list-item" onClick={() => handleItemClick(item)}>
        <IonCardContent className="info-search-item-content">
          <div className="info-search-item-main">
            {avatarUrl && (
              <img
                src={avatarUrl}
                alt="Avatar"
                className="info-search-item-avatar"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
            )}
            <div className="info-search-item-info">
              <div className="info-search-item-title">
                {visibleFields.find((f: any) => f.mapfield === "HoTen" || f.mapfield === "title")?.value || "Không rõ tiêu đề"}
              </div>
              <div className="info-search-item-details">
                {visibleFields.map((field: any, fieldIndex: number) => {
                  // Bỏ qua avatar và title vì đã hiển thị ở trên
                  if (field.mapfield === "avatar" || field.mapfield === "image" || field.mapfield === "HoTen" || field.mapfield === "title") return null;

                  return (
                    <div key={fieldIndex} className="info-search-item-field">
                      <span className="info-search-field-label">{field.key}:</span>
                      <span className="info-search-field-value">
                        {field.type === 'boolean'
                          ? (field.value ? 'Có' : 'Không')
                          : (field.value || "N/A")
                        }
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
          <div className="info-search-item-arrow">
            <IonIcon icon={chevronForwardOutline} />
          </div>
        </IonCardContent>
      </IonCard>
    );
  };

  const navigateToDetail = (item: any) => {
    window.open(item.url, '_blank', 'noopener,noreferrer');
  };

  const renderContent = () => {
    if ((dynamicLoading || formLoading) && currentData.length === 0) {
      return <Loading message="Đang tải dữ liệu tìm kiếm..." />;
    }

    if ((dynamicError || formError) && currentData.length === 0) {
      return <ErrorMessage message={`Lỗi: ${dynamicError || formError}`} />;
    }

    if (currentData.length === 0) {
      return <EmptyState message="Không có dữ liệu tìm kiếm" />;
    }

    return (
      <>
        <div className="info-search-page-list">
          {/* {currentData.map((item: any, index: number) =>
            renderInfoSearchItem(item, index)
          )} */}
          {currentData.map((item, index) => (
            <div key={index}>
              <div className="news-slide" onClick={() => navigateToDetail(item)}>
                <img src={item.image} alt={item.title} className="news-image" />
                <div className="news-overlay">
                  <h4>{item.title}</h4>
                </div>
              </div>
            </div>
          ))}
        </div>
        {/* {renderPagination()} */}
      </>
    );
  };

  return (
    <IonPage>
      <IonHeader className='ion-home-header_search_page'>
        <IonToolbar className="tool-bar-header custom-toolbar">
          <div className="toolbar-flex">
            <div className="toolbar-side">
              <IonButtons slot="start">
                <IonBackButton defaultHref="/" />
              </IonButtons>
            </div>
            <div className="toolbar-center">Tìm kiếm thông tin</div>
            <div className="toolbar-side" />
          </div>
          <div className="ion-search-header_page">
            <IonIcon icon={searchOutline} className="search-icon" />
            <IonInput
              placeholder={t('search_placeholder') || 'Tìm kiếm thông tin...'}
              className="search-input"
              type="text"
              value={searchInputValue}
              onIonInput={(e) => handleSearch(e.detail.value || '')}
            />
            <div className="search-actions">
              <IonIcon
                icon={filterOutline}
                className="action-icon"
                onClick={handleFilterClick}
              />
            </div>
          </div>
        </IonToolbar>
      </IonHeader>
      
      <IonContent>
        <div className='info-search-page-container'>
          {renderContent()}
        </div>
      </IonContent>

      {renderFilterPopover()}
    </IonPage>
  );
};

export default InfoSearchPage;