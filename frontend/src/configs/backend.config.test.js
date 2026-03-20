import { getBackendUrl, backendConfig } from './backend.config';

describe('getBackendUrl', () => {
    const defaultHost = import.meta.env.VITE_BACKEND_HOST;
    const defaultPort = import.meta.env.VITE_BACKEND_PORT;
    const defaultProtocol = import.meta.env.VITE_BACKEND_PROTOCOL;
    const defaultPrefix = '/api';

    afterEach(() => {
        backendConfig.host = defaultHost;
        backendConfig.port = defaultPort;
        backendConfig.protocol = defaultProtocol;
        backendConfig.prefix = defaultPrefix;
    });

    it('returns a complete URL with all parameters', () => {
        backendConfig.host = 'example.com';
        backendConfig.port = '8080';
        backendConfig.protocol = 'https';

        expect(getBackendUrl()).toBe('https://example.com:8080/api');
    });

    it('returns a URL without port if port is not a string', () => {
        backendConfig.host = 'example.com';
        backendConfig.port = undefined;
        backendConfig.protocol = 'https';
        expect(getBackendUrl()).toBe('https://example.com/api');
    });
});
