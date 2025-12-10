import { useLocation } from 'react-router-dom';
import { IonHeader } from '@ionic/react';
import HeaderHomePage from '../pages/home/HeaderHomePage';
import HeaderBookingPage from '../pages/health/booking/booking/HeaderBookingPage';

const GlobalHeader = () => {
  const location = useLocation();
  const path = location.pathname;
  let pageName = '';

  if (path === '/home') {
    pageName = 'home';
  } else if (path.startsWith('/booking')) {
    pageName = 'booking';
  } else {
    pageName = 'other';
  }

  return (
    <div>
      {pageName === 'home' && <HeaderHomePage/>}
      {pageName === 'booking' && <HeaderBookingPage/>}
      {/* {pageName === 'other' && <SearchBarOther />} */}
    </div>
  );
};
export default GlobalHeader;
