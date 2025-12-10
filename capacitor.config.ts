import type { CapacitorConfig } from '@capacitor/cli';
import { isAndroid, isDev, isIOS } from './env';

const config: CapacitorConfig = {
  appId: 'io.ionic.starter',
  appName: 'Flast_QLHS',
  webDir: 'dist',
  server: isDev && (isIOS || isAndroid)
    ? {
        url: 'http://172.168.8.108:5173',
        cleartext: true,
        allowNavigation: ['*'],
      }
    : {},
  android: {
    allowMixedContent: true,
    // minSdkVersion: 23,
  }
};


export default config;
