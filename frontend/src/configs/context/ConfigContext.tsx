import React, {createContext, useContext, useState, useEffect, ReactNode} from 'react';
import {retrieveConfig} from "../queries/retrieve-configs.tsx";
import {getBackendUrl} from "../backend.config.ts";

interface ConfigContextValue {
    configs: Record<string, string>;
    loading: boolean;
}

interface ConfigProviderProps {
    children: ReactNode;
}

export const ConfigContext = createContext<ConfigContextValue | null>(null);

export const ConfigProvider: React.FC<ConfigProviderProps> = ({ children }) => {
    const [configs, setConfigs] = useState<Record<string, string>>({});
    const [loading, setLoading] = useState<boolean>(true);
    const [isError, setIsError] = useState<boolean>(false);

    useEffect(() => {
        (async () => {
            try {
                const configs: Record<string, any> = await retrieveConfig(getBackendUrl());
                setConfigs(configs);
            } catch (err) {
                setIsError(true);
            }

            setLoading(false);
        })();
    }, []);

    if (isError) {
        return <div>Erreur lors du chargement des configurations.</div>;
    }

    return (
        <ConfigContext.Provider value={{ configs, loading }}>
            {children}
        </ConfigContext.Provider>
    );
};

export const useConfig = (): ConfigContextValue | null => useContext(ConfigContext);
