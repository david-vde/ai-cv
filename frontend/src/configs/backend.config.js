export const backendConfig = {
    "host": "localhost",
    "port": 8000,
    "protocol": "http",
    "prefix": "/api"
};

export const getBackendUrl = () => {
    return backendConfig.protocol + "://" + backendConfig.host + ":" + backendConfig.port + backendConfig.prefix;
}