export const backendConfig: Record<string, string> = {
    "host": import.meta.env.VITE_BACKEND_HOST,
    "port": import.meta.env.VITE_BACKEND_PORT,
    "protocol": import.meta.env.VITE_BACKEND_PROTOCOL,
    "prefix": "/api"
};

export const getBackendUrl = (): string => {
    return backendConfig.protocol + "://"
        + backendConfig.host
        + (typeof backendConfig.port === "string" ? ":" + backendConfig.port : "")
        + backendConfig.prefix;
}