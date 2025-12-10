import { useEffect, useRef } from 'react';
import { App as CapacitorApp } from '@capacitor/app';
import { Storage } from '@capacitor/storage';
import { useHistory } from 'react-router-dom';

const AppLifecycleHandler = () => {
  const history = useHistory();
  const lastLeftTime = useRef<number | null>(null);

  useEffect(() => {
    let sub: { remove: () => void } | null = null;

    const initListener = async () => {
      sub = await CapacitorApp.addListener('appStateChange', async (state) => {
        if (!state.isActive) {
          lastLeftTime.current = Date.now();
          return;
        }

        const now = Date.now();
        if (lastLeftTime.current && now - lastLeftTime.current > 1000) {
          const { value: token } = await Storage.get({ key: 'auth_token' });
          const path = window.location.pathname;

          // Trang công khai
          const publicPaths = ['/', '/home', '/booking', '/login'];

          // Nếu không có token và đang ở private page → về login
          if (!token && !publicPaths.includes(path)) {
            history.replace(`/login`);
          }
        }
        lastLeftTime.current = null;
      });
    };

    initListener();

    // Cleanup
    return () => {
      if (sub) {
        sub.remove();
      }
    };
  }, [history]);

  return null;
};

export default AppLifecycleHandler;
