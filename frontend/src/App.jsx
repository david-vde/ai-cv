import {useRef} from "react";
import './App.css'
import ChatBox from "./chat/components/ChatBox.jsx";
import "./assets/sass/layout.scss";
import Header from "./header/components/Header.jsx";
import {PacmanLoader} from "react-spinners";
import {useConfig} from "./configs/context/ConfigContext.jsx";
import {Route, Routes} from "react-router"
import {useTranslation} from "react-i18next";

function App() {
  const refChatBox = useRef(null);
  const { loading: loadingConfig } = useConfig();
  const { t } = useTranslation();

  const onClickPresetQuestion = (question) => {
    if (refChatBox.current) {
      refChatBox.current.sendPreset(question);
    }
  }

  if (loadingConfig) {
    return (
      <div className="loader-wrapper">
        <PacmanLoader loading={true} color="#36d7b7" size={25} />
      </div>
    )
  }

  return (
    <div>
      <Header />

      <div className="main">
        <div className="chat-panel">
          <Routes>
            <Route path="/" element={<ChatBox ref={refChatBox} onClickPresetQuestion={onClickPresetQuestion}/>} />
            <Route path="/cv" element={<div>CV</div>} />
            <Route path="/career" element={<div>Career</div>} />
            <Route path="*" element={<h2>404 - {t("errors.http.404.label")}</h2>} />
          </Routes>
        </div>
      </div>
    </div>
  );
}

export default App
