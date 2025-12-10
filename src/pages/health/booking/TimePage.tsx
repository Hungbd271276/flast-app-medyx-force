import React, { useEffect, useState } from 'react';
import {
  IonPage, IonLabel, IonInput, IonButton,
  IonModal,
  IonIcon,
  IonGrid,
  IonRow,
  IonCol
} from '@ionic/react';
import CustomDatePicker from '../../../components/datepiker/CustomDatePiker';
import axiosInstance from '../../../utils/functions/axios';
import { fetchKhungGioKham, setSelectedDate, setSelectedTimeSlot } from '../../../utils/redux/booking';
import { useDispatch, useSelector } from '../../../utils/redux/hooks';
import { chevronBackOutline, chevronForwardOutline } from 'ionicons/icons';
import { useTranslation } from 'react-i18next';
import './TimePage.css';

interface TimePageProps {
  onBack: () => void;
  onNext: () => void;
}

const TimePage: React.FC<TimePageProps> = ({ onBack, onNext }) => {
  const dispatch = useDispatch();
  const khungGioKham = useSelector((state: any) => state.booking.khungGioKham) ?? [];
  const { t } = useTranslation();
  // Lấy selectedDate từ Redux (dưới dạng string)
  const selectedDateStr = useSelector((state: any) => state.booking.selectedDate);
  const selectedDate = selectedDateStr ? new Date(selectedDateStr) : null;

  const selectedTimeSlot = useSelector((state: any) => state.booking.selectedTimeSlot);

  const [showDateModal, setShowDateModal] = useState(false);
  const advancedOption = useSelector((state: any) => state.booking.advancedOption);

  useEffect(() => {
    dispatch(fetchKhungGioKham());
  }, [dispatch]);

  const handleOpenDatePicker = () => setShowDateModal(true);

  const handleSelectDate = (date: Date) => {
  dispatch(setSelectedDate(date.toISOString()));
  dispatch(setSelectedTimeSlot(null));
  setShowDateModal(false);
};
  const getSlotId = (item: any) => {
    const start = item.patientData.find((d: any) => d.key === 'Giờ bắt đầu')?.value;
    const end = item.patientData.find((d: any) => d.key === 'Giờ kết thúc')?.value;
    return `${start}-${end}`;
  };


  const handleSelectTimeSlot = (slot: any) => {
    dispatch(setSelectedTimeSlot(getSlotId(slot)));
  };

  const buoiSang = khungGioKham.filter((item: any) =>
    item.patientData.find((d: any) => d.key === 'Buổi')?.value === 'Sáng'
  );

  const buoiChieu = khungGioKham.filter((item: any) =>
    item.patientData.find((d: any) => d.key === 'Buổi')?.value === 'Chiều'
  );

  const renderGioKham = (list: any[], maxSlots: number) => {
    const slots = list.map((item, idx) => {
      const slotId = getSlotId(item);
      const start = item.patientData.find((d: any) => d.key === 'Giờ bắt đầu')?.value;
      const end = item.patientData.find((d: any) => d.key === 'Giờ kết thúc')?.value;

      return (
        <IonCol size="6" key={idx}>
          <div
            key={slotId}
            className={`hour-slot${selectedTimeSlot === slotId ? ' selected' : ''}`}
            onClick={() => handleSelectTimeSlot(item)}
          >
            {start?.slice(0, 5)} - {end?.slice(0, 5)}
          </div>
        </IonCol>
      );
    });

    // Thêm các slot rỗng nếu thiếu
    while (slots.length < maxSlots) {
      slots.push(<div className="hour-slot empty" key={`empty-${slots.length}`}></div>);
    }

    return slots;
  };
  const maxSlots = Math.max(buoiSang.length, buoiChieu.length);

  return (
    <div>
      <div className="time-page">
        <div className='time-date-booking'>
          <IonLabel className="form-label" style={{ padding: '15px', fontSize: '20px' }}>{t('date_time')}</IonLabel>
          <div className="date-picker-row">
            <IonInput
              value={selectedDate ? selectedDate.toLocaleDateString('vi-VN') : ''}
              readonly
              className="date-input"
              placeholder={t('select_time')}
            />
            <IonButton className="date-btn" onClick={handleOpenDatePicker}>
              {t('select_time')}
            </IonButton>
          </div>
        </div>

        {/* Chỉ hiển thị phần chọn giờ khi đã chọn ngày */}
        {selectedDate && (
          <div className='info-hours-booking'>
            <IonLabel className="form-label" style={{ padding: '15px', fontSize: '20px' }}>{t('hour_time')}</IonLabel>

            <div className="session-block">
              <b>Buổi sáng</b>
              <IonGrid>
                <IonRow>
                  {renderGioKham(buoiSang, maxSlots)}
                </IonRow>
              </IonGrid>
            </div>

            <div className="session-block">
              <b>Buổi chiều</b>
              <IonGrid>
                <IonRow>
                  {renderGioKham(buoiChieu, maxSlots)}
                </IonRow>
              </IonGrid>
            </div>
          </div>
        )}

        {/* Thông báo khi chưa chọn ngày */}
        {!selectedDate && (
          <div className="info-hours-booking">
            <div className="date-selection-prompt">
              <p>Vui lòng chọn ngày khám để xem các khung giờ có sẵn</p>
            </div>
          </div>
        )}
      </div>

      {/* Modal chọn ngày */}
      <IonModal
        isOpen={showDateModal}
        onDidDismiss={() => setShowDateModal(false)}
        className="modal-bottom-sheet"
        breakpoints={[0.2, 0.5, 0.5]}
        initialBreakpoint={0.5}
      >
        <div className="custom-date-modal">
          <div className="modal-header">
            <span>Chọn ngày khám</span>
            <button className="modal-close-btn" onClick={() => setShowDateModal(false)}>✕</button>
          </div>
          <CustomDatePicker
            onClose={() => setShowDateModal(false)}
            onDateSelect={handleSelectDate}
            allowPast={false}
          />
        </div>
      </IonModal>
      
      <div className="navigation-buttons">
        <IonButton fill="outline" onClick={onBack} className="back-btn">
          <IonIcon slot="start" icon={chevronBackOutline} />
          Quay lại
        </IonButton>
        <IonButton
          onClick={onNext}
          className="confirm-btn"
          disabled={!selectedDate || !selectedTimeSlot} // Sửa logic disabled
        >
          Tiếp tục
          <IonIcon slot="end" icon={chevronForwardOutline} />
        </IonButton>
      </div>
    </div>
  );
};

export default TimePage;
