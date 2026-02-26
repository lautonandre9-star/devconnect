/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string
  readonly VITE_APP_NAME?: string
  readonly VITE_APP_VERSION?: string
  // adicione mais variáveis conforme necessário
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}