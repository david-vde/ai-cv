import {useRef} from "react";
import './App.css'
import ChatBox, {ChatBoxRef} from "./chat/components/ChatBox.tsx";
import "./assets/sass/layout.scss";
import Header from "./header/components/Header.tsx";
import {PacmanLoader} from "react-spinners";
import {useConfig} from "./configs/context/ConfigContext.tsx";
import {Route, Routes} from "react-router"
import {useTranslation} from "react-i18next";
import Cv from "./cv/components/Cv.tsx";
import Footer from "./footer/components/Footer.tsx";

const App = () => {
  const refChatBox = useRef<ChatBoxRef>(null);
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
            <Route
              path="/"
              element={
                <ChatBox
                  ref={refChatBox}
                  onClickPresetQuestion={onClickPresetQuestion}/>
              }
            />
            <Route path="/cv" element={<Cv />} />
            <Route path="*" element={<h2>404 - {t("errors.http.404.label")}</h2>} />
          </Routes>
        </div>
      </div>

      <Footer />
    </div>
  );
}

export default App
