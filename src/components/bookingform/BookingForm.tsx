import { IonBackButton, IonButtons, IonContent, IonHeader, IonLabel, IonPage, IonTabButton, IonToolbar, IonIcon, IonImg, IonButton } from "@ionic/react";
import React from "react";

import { homeOutline } from 'ionicons/icons';
import AvatarIcon from '../../assets/svg/AVT.svg';
import { useSelector } from '../../utils/redux/hooks';
import './BookingForm.css';

interface BookingFormProps {
  onClose: () => void;
  onDateSelect?: (date: Date) => void;
  allowPast?: boolean;
}

const BookingForm: React.FC<BookingFormProps> = ({ onClose, onDateSelect, allowPast }) => {
  const formData = useSelector(state => state.booking.formData);
  const defaultValues = useSelector(state => state.booking.defaultValues);

  const bookingInfo = { ...defaultValues, ...formData };

  const formatDate = (dateString: string) => {
    if (!dateString || !/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
      return dateString; // Trả về giá trị gốc nếu không đúng định dạng
    }
    const [year, month, day] = dateString.split('-');
    return `${day}/${month}/${year}`;
  };

  // Hàm hỗ trợ chuyển ID giới tính sang chữ
  const formatGender = (genderId: string) => {
    if (genderId === '1') return 'Nam';
    if (genderId === '2') return 'Nữ';
    return 'Không xác định';
  };
  return (
    <IonPage className='ion-home-page'>
      <IonHeader className='ion-home-header'>
        <IonToolbar className="tool-bar-header custom-toolbar">
          <div className="toolbar-flex-form">
            <div className="toolbar-side-form">
              <IonButtons slot="start">
                <IonBackButton defaultHref="/booking" />
              </IonButtons>
            </div>
            <div className="toolbar-center-bkf">Phiếu đặt lịch khám</div>
            <div className="toolbar-side-bkf">
              <IonButton routerLink="/home" fill="clear">
                <IonIcon style={{ color: 'white' }} icon={homeOutline} />
              </IonButton>
            </div>
          </div>
        </IonToolbar>
      </IonHeader>
      <IonContent className="custom-bk-form-content">
        <div className="profile-cus">
          <div className="booking-form-header-bg">
            <IonImg src={AvatarIcon} className="booking-form-avatar" alt="User Avatar" />
          </div>
        </div>
      </IonContent>
    </IonPage>
  );
}

export default BookingForm;