import {
  IonApp,
  setupIonicReact
} from '@ionic/react';
import { App as CapacitorApp } from '@capacitor/app';
import { Storage } from '@capacitor/storage';

/* Core CSS required for Ionic components to work properly */
import '@ionic/react/css/core.css';

/* Basic CSS for apps built with Ionic */
import '@ionic/react/css/normalize.css';
import '@ionic/react/css/structure.css';
import '@ionic/react/css/typography.css';

/* Optional CSS utils that can be commented out */
import '@ionic/react/css/padding.css';
import '@ionic/react/css/float-elements.css';
import '@ionic/react/css/text-alignment.css';
import '@ionic/react/css/text-transformation.css';
import '@ionic/react/css/flex-utils.css';
import '@ionic/react/css/display.css';
import { createAnimation } from '@ionic/react';

/**
 * Ionic Dark Mode
 * -----------------------------------------------------
 * For more info, please see:
 * https://ionicframework.com/docs/theming/dark-mode
 */

/* import '@ionic/react/css/palettes/dark.always.css'; */
/* import '@ionic/react/css/palettes/dark.class.css'; */
import '@ionic/react/css/palettes/dark.system.css';

/* Theme variables */
import './theme/variables.css';
import AppRouter from './routes/AppRouter';
import { IonReactRouter } from '@ionic/react-router';
import { useEffect, useRef } from 'react';
import { restoreAuthFromStorage } from './utils/functions/authService';
import { initNotifications } from './utils/functions/notification';
import { useDispatch } from './utils/redux/hooks';
import { useHistory } from 'react-router-dom';
setupIonicReact();

const App: React.FC = () => {
  const history = useHistory();
  const lastLeftTime = useRef<number | null>(null);
  const dispatch = useDispatch();

  useEffect(() => {
    restoreAuthFromStorage(dispatch); // gọi lại khi app khởi động
    // Khởi tạo notifications system
    initNotifications();
  }, []);

  useEffect(() => {
    const sub = CapacitorApp.addListener('appStateChange', async (state) => {
      if (!state.isActive) {
        // App chuyển sang background → lưu thời điểm
        lastLeftTime.current = Date.now();
      } else {
        // App quay lại foreground
        const now = Date.now();
        if (lastLeftTime.current && now - lastLeftTime.current > 20000) { // ví dụ: 20s
          // Nếu rời app > 10 giây → logout
          // await Storage.remove({key: 'auth_user'});
          // await Storage.remove({key: 'auth_token'});
          const { value: token } = await Storage.get({ key: 'token' });

          const path = window.location.pathname;
          const publicPaths = ['/', '/home']; // bạn có thể thêm nhiều nếu cần

          if (token && !publicPaths.includes(path)) {
            await Storage.clear();
            history.replace('/login');
          }
        }
        
        lastLeftTime.current = null;
      }
    });

    return () => {
      sub.remove();
    };
  }, []);

  // ✅ Custom animation global
const customNavAnimation = (baseEl: any, opts?: any) => {
  const enteringEl = opts.enteringEl;
  const leavingEl = opts.leavingEl;

  const enteringAnimation = createAnimation()
    .addElement(enteringEl)
    .duration(250)
    .easing('ease-out')
    .fromTo('opacity', '0', '1')
    .fromTo('transform', 'translateX(100%)', 'translateX(0)');

  const leavingAnimation = createAnimation()
    .addElement(leavingEl)
    .duration(250)
    .easing('ease-in')
    .fromTo('opacity', '1', '0')
    .fromTo('transform', 'translateX(0)', 'translateX(-50%)');

  return createAnimation().addAnimation([enteringAnimation, leavingAnimation]);
};

// ⚡️ Setup trước khi render app
setupIonicReact({
  navAnimation: customNavAnimation
});

  return (
     <IonApp>
        <AppRouter />
    </IonApp>
  );
};

export default App;
