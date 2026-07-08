/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** URL base da API do backend (ex: http://localhost:3000) */
  readonly VITE_API_URL: string
  /** JWT fixo gerado via POST /auth/login do admin seed */
  readonly VITE_API_TOKEN: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
