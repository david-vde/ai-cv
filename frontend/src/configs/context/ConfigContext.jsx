import React, { createContext, useContext, useState, useEffect } from 'react';
import {retrieveConfig} from "../queries/retrieve-configs.jsx";
import {getBackendUrl} from "../backend.config.js";

export const ConfigContext = createContext(null);

export const ConfigProvider = ({ children }) => {
    const [configs, setConfigs] = useState({});
    const [loading, setLoading] = useState(true);
    const [isError, setIsError] = useState(false);

    useEffect(() => {
        (async () => {
            try {
                const configs = await retrieveConfig(getBackendUrl());

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

export const useConfig = () => useContext(ConfigContext);