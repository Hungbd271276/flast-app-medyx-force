import React, { useEffect, useState, useRef } from 'react';
import {
  IonPage, IonHeader, IonToolbar, IonBackButton, IonContent,
  IonLabel, IonTabButton, IonButtons,
  IonFooter
} from '@ionic/react';
import { useDispatch,useSelector } from '../../../../utils/redux/hooks';
import { clearBookingState } from '../../../../utils/redux/booking';
import { useHistory } from 'react-router-dom';

// ... existing code ...
import InfoPage from '../InfoPage';
import TimePage from '../TimePage';
import DepartmentPage from '../DepartmentPage';
import DoctorPage from '../DoctorPage';
import PaymentPage from '../PaymentPage';
import RegisterPage from '../RegisterPage';

import './BookingPage.css';

const allSteps = [
  { key: 'info', label: 'Thông tin cá nhân' },
  { key: 'department', label: 'Chọn khoa' },
  { key: 'doctor', label: 'Chọn bác sĩ' },
  { key: 'time', label: 'Thời gian' },
  { key: 'payment', label: 'Thanh toán' },
  { key: 'register', label: 'Đăng ký khám' },
];

const BookingPage: React.FC = () => {
  const dispatch = useDispatch();
  const [activeTab, setActiveTab] = useState<'info' | 'time' | 'department' | 'doctor' | 'payment' | 'register'>('info');
  const advancedOption = useSelector(state => state.booking.advancedOption);
  const [showBookingForm, setShowBookingForm] = useState(false);
  const prevAdvancedOption = useRef(advancedOption);
  const history = useHistory();


  const handlePaymentNext = () => {
    history.push('/booking-form');
  };
  const steps = advancedOption
    ? allSteps
    : allSteps.filter(step => !['department', 'doctor'].includes(step.key));


  const stepKeys = steps.map(step => step.key);
  const currentStepIndex = stepKeys.indexOf(activeTab);

  const renderPage = () => {
    switch (activeTab) {
      case 'info':
        return <InfoPage onNext={(nextTab) => setActiveTab(nextTab || 'time')} />;
        case 'time':
          return <TimePage onBack={() => {
            if (advancedOption) setActiveTab('doctor');
            else setActiveTab('info');
           }}  onNext={() => setActiveTab('payment')} />;
        case 'department':
          return <DepartmentPage onNext={() => setActiveTab('doctor')} onBack={() => setActiveTab('info')} />;
      case 'doctor':
        return <DoctorPage onNext={() => setActiveTab('time')} onBack={() => setActiveTab('department')} />;
      case 'payment':
        return <PaymentPage onNext={() => setActiveTab('register')} onBack={() => setActiveTab('time')} />;
        case 'register':
        return <RegisterPage activeTab={activeTab} onNext={handlePaymentNext} onBack={() => setActiveTab('payment')} />;
      default:
        return null;
    }
  };
  const tabRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const handleFinishBooking = () => {
    setShowBookingForm(true);
  };

useEffect(() => {
  const el = tabRefs.current[activeTab];
  if (el) {
    el.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
  }
}, [activeTab]);


  return (
    <IonPage className='ion-page_booking'>
      <IonContent className="custom-bk-content">
        {/* Thanh tab bước */}
        <div className="booking-tab-buttons" style={{ overflowX: 'auto', whiteSpace: 'nowrap' }}>
        {steps.map((step, idx) => (
          <div
            key={step.key}
            ref={(el: HTMLDivElement | null) => { tabRefs.current[step.key] = el; }}
            style={{ flex: 1, display: 'flex' }}
          >
            <IonTabButton
              tab={step.key}
              onClick={() => {
                if (idx <= currentStepIndex) setActiveTab(step.key as typeof activeTab);
              }}
              className={
                (activeTab === step.key ? 'active ' : '') +
                (idx > currentStepIndex ? 'disabled' : '')
              }
              disabled={idx > currentStepIndex}
            >
              <IonLabel className='title-tab-booking'>{step.label}</IonLabel>
            </IonTabButton>
          </div>
        ))}
      </div>
      {/* Nội dung của từng bước */}
      <div className="tab-content">
        {renderPage()}
      </div>
    </IonContent>
  </IonPage>
  );
};

export default BookingPage;