import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import {ConfigProvider} from "./configs/context/ConfigContext.jsx";
import {BrowserRouter} from "react-router";

createRoot(document.getElementById('root')).render(
  <StrictMode>
      <ConfigProvider>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </ConfigProvider>
  </StrictMode>,
)
