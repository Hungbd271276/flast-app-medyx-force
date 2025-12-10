// import {
//   IonTabs,
//   IonTabBar,
//   IonTabButton,
//   IonRouterOutlet,
//   IonIcon,
//   IonLabel,
// } from '@ionic/react';
// import { Redirect, Route, useLocation } from 'react-router-dom';
// import { homeOutline, documentOutline, notificationsOutline, personOutline } from 'ionicons/icons';
// import HomePage from '../home/HomePage';
// import ProfilePage from '../record/RecordHealthPage';
// // import NotificationPage from '../notifications/NotificationPage';
// // import AccountPage from '../account/AccountPage';
// import BookingPage from '../health/booking/booking/BookingPage';
// import DoctorPage from '../doctorpage/DoctorPage';
// import DoctorDetailPage from '../doctorpage/DoctorDetailPage';
// import AppointmentCheckPage from '../appointment/AppointmentCheckPage';
// import ServicePage from '../service/ServicePage';
// import ServiceDetailPage from '../service/ServiceDetailPage';
// import RecordHealthPage from '../record/RecordHealthPage';
// import RecordHealthDetailPage from '../record/RecordHealthDetailpage';
// import './MainTabs.css';
// import { useTranslation } from 'react-i18next';
// import ProtectedLoginRoute from '../../routes/ProtectedLoginRoute';
// import FamilyPage from '../family/FamilyPage';
// import InfoSearchPage from '../infosearch/InfoSearchPage';
// import ReminderPage from '../reminder/ReminderPage';
// import LoginPage from '../Login';


// const MainTabs: React.FC = () => {
//   const { t } = useTranslation();
//   const location = useLocation();
//   const hideTabBar = ['/settings', '/login', '/register'].includes(location.pathname);

//   return (
//     <IonTabs>
//       <IonRouterOutlet>
//         <ProtectedLoginRoute exact path="/login" component={LoginPage} />
//         <Route exact path="/home" component={HomePage} />
//         <Route exact path="/profile" component={ProfilePage} />
//         {/* <Route exact path="/notifications" component={NotificationPage} /> */}
//         {/* <Route exact path="/account" component={AccountPage} /> */}
//         {/* Các route tab khác nếu muốn tab bar xuất hiện */}
//         <Route exact path="/booking" component={BookingPage} />
//         <Route exact path="/doctor" component={DoctorPage} />
//         <Route exact path="/doctor-detail" component={DoctorDetailPage} />
//         <Route exact path="/appointment-check" component={AppointmentCheckPage} />
//         <Route exact path="/services" component={ServicePage} />
//         <Route exact path="/service-detail" component={ServiceDetailPage} />
//         <Route exact path="/health-profile" component={RecordHealthPage} />
//         <Route exact path="/family" component={FamilyPage} />
//         <Route exact path="/info-search" component={InfoSearchPage} />
//         <Route exact path="/reminder" component={ReminderPage} />
//         <Route exact path="/health-profile-detail" component={RecordHealthDetailPage} />
//         <Route exact path="/">
//           <Redirect to="/home" />
//         </Route>
//       </IonRouterOutlet>

//       {!hideTabBar && (
//         <IonTabBar slot="bottom">
//           <IonTabButton tab="home" href="/home">
//             <IonIcon icon={homeOutline} />
//             <IonLabel>{t('icon_home')}</IonLabel>
//           </IonTabButton>
//           <IonTabButton tab="profile" href="/profile">
//             <IonIcon icon={documentOutline} />
//             <IonLabel>{t('icon_profile')}</IonLabel>
//           </IonTabButton>
//           <IonTabButton tab="notifications" href="/notifications">
//             <IonIcon icon={notificationsOutline} />
//             <IonLabel>{t('icon_notifications')}</IonLabel>
//           </IonTabButton>
//           <IonTabButton tab="account" href="/account">
//             <IonIcon icon={personOutline} />
//             <IonLabel>{t('icon_account')}</IonLabel>
//           </IonTabButton>
//         </IonTabBar>
//       )}
//     </IonTabs>
//   );
// };

// export default MainTabs;

import {
  IonTabs,
  IonTabBar,
  IonTabButton,
  IonRouterOutlet,
  IonIcon,
  IonLabel,
} from '@ionic/react';
import { Redirect, Route, useLocation } from 'react-router-dom';
import { homeOutline, documentOutline, notificationsOutline, personOutline } from 'ionicons/icons';
import { useTranslation } from 'react-i18next';

import GlobalHeader from '../../routes/GlobalHeader';
import ProtectedLoginRoute from '../../routes/ProtectedLoginRoute';

import HomePage from '../home/HomePage';
import ProfilePage from '../record/RecordHealthPage';
import BookingPage from '../health/booking/booking/BookingPage';
import DoctorPage from '../doctorpage/DoctorPage';
import DoctorDetailPage from '../doctorpage/DoctorDetailPage';
import AppointmentCheckPage from '../appointment/AppointmentCheckPage';
import ServicePage from '../service/ServicePage';
import ServiceDetailPage from '../service/ServiceDetailPage';
import RecordHealthPage from '../record/RecordHealthPage';
import RecordHealthDetailPage from '../record/RecordHealthDetailpage';
import FamilyPage from '../family/FamilyPage';
import InfoSearchPage from '../infosearch/InfoSearchPage';
import ReminderPage from '../reminder/ReminderPage';
import LoginPage from '../Login';

import './MainTabs.css';

const MainTabs: React.FC = () => {
  const { t } = useTranslation();
  const location = useLocation();

  // Ẩn TabBar với các trang không cần
  const hideTabBar = ['/settings', '/login', '/register', '/booking'].includes(location.pathname);

  return (
    <IonTabs>
      {/* Header chung cho các page thuộc Tabs */}
      {!['/login', '/register'].includes(location.pathname) && <GlobalHeader />}

      <IonRouterOutlet>
        {/* Các route ngoài Tabs */}
        <ProtectedLoginRoute exact path="/login" component={LoginPage} />

        {/* Các route trong Tabs */}
        <Route exact path="/home" component={HomePage} />
        <Route exact path="/profile" component={ProfilePage} />
        <Route exact path="/booking" component={BookingPage} />
        <Route exact path="/doctor" component={DoctorPage} />
        <Route exact path="/doctor-detail" component={DoctorDetailPage} />
        <Route exact path="/appointment-check" component={AppointmentCheckPage} />
        <Route exact path="/services" component={ServicePage} />
        <Route exact path="/service-detail" component={ServiceDetailPage} />
        <Route exact path="/health-profile" component={RecordHealthPage} />
        <Route exact path="/family" component={FamilyPage} />
        <Route exact path="/info-search" component={InfoSearchPage} />
        <Route exact path="/reminder" component={ReminderPage} />
        <Route exact path="/health-profile-detail" component={RecordHealthDetailPage} />

        {/* Mặc định về Home */}
        <Route exact path="/">
          <Redirect to="/home" />
        </Route>
      </IonRouterOutlet>

      {/* Tab bar */}
      {!hideTabBar && (
        <IonTabBar slot="bottom">
          <IonTabButton tab="home" href="/home">
            <IonIcon icon={homeOutline} />
            <IonLabel>{t('icon_home')}</IonLabel>
          </IonTabButton>
          <IonTabButton tab="profile" href="/profile">
            <IonIcon icon={documentOutline} />
            <IonLabel>{t('icon_profile')}</IonLabel>
          </IonTabButton>
          <IonTabButton tab="notifications" href="/notifications">
            <IonIcon icon={notificationsOutline} />
            <IonLabel>{t('icon_notifications')}</IonLabel>
          </IonTabButton>
          <IonTabButton tab="account" href="/account">
            <IonIcon icon={personOutline} />
            <IonLabel>{t('icon_account')}</IonLabel>
          </IonTabButton>
        </IonTabBar>
      )}
    </IonTabs>
  );
};

export default MainTabs;

