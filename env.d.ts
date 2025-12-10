/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_NODE_ENV: string;
  readonly VITE_CAPACITOR_PLATFORM: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
