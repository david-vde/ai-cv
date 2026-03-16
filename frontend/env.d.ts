interface ImportMetaEnv {
    readonly VITE_BACKEND_HOST: string
    readonly VITE_BACKEND_PORT: string
    readonly VITE_BACKEND_PROTOCOL: string
}

interface ImportMeta {
    readonly env: ImportMetaEnv
}