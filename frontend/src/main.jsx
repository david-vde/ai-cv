import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import {ConfigProvider} from "./configs/context/ConfigContext.tsx";
import {BrowserRouter} from "react-router";
import './i18n';

createRoot(document.getElementById('root')).render(
  <StrictMode>
      <ConfigProvider>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </ConfigProvider>
  </StrictMode>,
)
