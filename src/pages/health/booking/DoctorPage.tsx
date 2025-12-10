import React, { useMemo, useEffect, useState } from 'react';
import { IonPage, IonButton, IonIcon, IonModal } from '@ionic/react';
import { fetchDoctor, setSelectedDoctor, fetchServiceListDynamic, setSelectedService } from '../../../utils/redux/booking';
import { useDispatch, useSelector } from '../../../utils/redux/hooks';
import { useTranslation } from 'react-i18next';
import { chevronBackOutline, chevronForwardOutline, addOutline, chevronForwardOutline as arrowIcon } from 'ionicons/icons';
import DoctorGrid from '../../../components/doctorgrid/DoctorGrid';
import './DoctorPage.css';

interface DoctorPageProps {
  onNext: () => void;
  onBack: () => void;
}

interface Doctor {
  id: string;
  name: string;
  TenCV: string;
  TenKhoa: string;
}

const DoctorPage: React.FC<DoctorPageProps> = ({ onNext, onBack }) => {
  const dispatch = useDispatch();
  const publicMenu = useSelector(state => state.booking.publicMenu);

  const controlFormsMap = useMemo(() => {
    const controls = publicMenu?.data?.find((item: any) => item.orderId === 2)?.controlForm || [];
    return controls.reduce((acc: Record<string, any>, ctrl: any) => {
      acc[ctrl.mapfield] = ctrl;
      return acc;
    }, {});
  }, [publicMenu]);
  const serviceControl = controlFormsMap['MaDV'];

  const serviceList = useSelector((state: any) => state.booking.serviceList);
  const serviceListLoading = useSelector((state: any) => state.booking.serviceListLoading);
  const selectedServiceId = useSelector((state: any) => state.booking.selectedServiceId);

  const doctorList: Doctor[] = useSelector((state: any) => state.booking.doctorList);
  const selectedDoctorId = useSelector((state: any) => state.booking.selectedDoctorId);
  const selectedDepartmentId = useSelector((state: any) => state.booking.selectedDepartmentId);
  const [showServiceModal, setShowServiceModal] = useState(false);

  useEffect(() => {
    if (selectedDepartmentId && selectedServiceId) {
      dispatch(fetchDoctor(String(selectedDepartmentId)));
    }
  }, [dispatch, selectedDepartmentId, selectedServiceId]);

  useEffect(() => {
    if (serviceControl?.dataSourceApi && serviceControl?.body) {
      dispatch(fetchServiceListDynamic({
        dataSourceApi: serviceControl.dataSourceApi,
        body: serviceControl.body
      }));
    }
  }, [dispatch, serviceControl]);

  const handleSelectDoctor = (id: string) => {
    dispatch(setSelectedDoctor(id));
  };
  const handleSelectService = (id: string) => {
    dispatch(setSelectedService(id));
    dispatch(setSelectedDoctor(null));
    setShowServiceModal(false);
  };

  const { t } = useTranslation();

  // Lấy tên dịch vụ đã chọn
  const selectedServiceName =
  (serviceList && serviceList.find((s: any) => (s.id || s.MaDV) === selectedServiceId)?.name) ||
  (serviceList && serviceList.find((s: any) => (s.id || s.MaDV) === selectedServiceId)?.TenDV) ||
  '';

  return (
    <div>
      <div className="doctor-page">
      <div style={{ marginTop: 24 }}>
          <h3 className="news-section-title">{t('service_select')}</h3>
          <div className="service-picker-row" onClick={() => setShowServiceModal(true)}>
            <IonIcon icon={addOutline} className="service-picker-icon" />
            <span className="service-picker-text">
              {selectedServiceName || 'Chọn dịch vụ'}
            </span>
            <IonIcon icon={chevronForwardOutline} className="service-picker-arrow" />
          </div>
          <IonModal
            isOpen={showServiceModal}
            onDidDismiss={() => setShowServiceModal(false)}
            className="modal-bottom-sheet"
            breakpoints={[0, 0.5, 0.5]}
            initialBreakpoint={0.5}
          >


            <div className="custom-service-modal">
              <div className="modal-header">
                <span>Chọn dịch vụ</span>
                <button className="modal-close-btn" onClick={() => setShowServiceModal(false)}>✕</button>
              </div>
              <div className="service-list" style={{ maxHeight: 300, overflowY: 'auto', width: '100%' }}>
                {serviceListLoading ? (
                  <div>Đang tải dịch vụ...</div>
                ) : (
                  (serviceList || []).map((service: any) => (
                    <div
                      key={service.id || service.MaDV}
                      className={`service-item${selectedServiceId === (service.id || service.MaDV) ? ' selected' : ''}`}
                      onClick={() => handleSelectService(service.id || service.MaDV)}
                    >
                      {service.name || service.TenDV}
                    </div>

            ))
                )}
              </div>
            </div>
          </IonModal>
        </div>
        <h3 className="news-section-title">{t('doctor_list')}</h3>
        <div className="doctor-list-page" style={{ display: 'flex', flexWrap: 'wrap', gap: '16px' }}>
          {doctorList.map((doctor) => (
            <DoctorGrid
            key={doctor.id}
            id={doctor.id}
            name={doctor.name}
            speciality={doctor.TenKhoa}
            experience={doctor.TenCV}
            selected={selectedDoctorId === doctor.id}
            onSelect={selectedServiceId ? handleSelectDoctor : () => {}} 
            />
          ))}
        </div>
      </div>
      <div className="navigation-buttons">
        <IonButton fill="outline" onClick={onBack} className="back-btn">
          <IonIcon slot="start" icon={chevronBackOutline} />
          Quay lại
        </IonButton>
        <IonButton
          onClick={onNext}
          className="confirm-btn"
          disabled={!selectedDoctorId || !selectedServiceId}
        >
          Tiếp tục
          <IonIcon slot="end" icon={chevronForwardOutline} />
        </IonButton>
      </div>
    </div>
  );
};

export default DoctorPage;
