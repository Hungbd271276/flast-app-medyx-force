// env.ts
export const isDev = process.env.VITE_NODE_ENV !== 'production';
export const isIOS = process.env.VITE_CAPACITOR_PLATFORM === 'ios';
export const isAndroid = process.env.VITE_CAPACITOR_PLATFORM === 'android';
