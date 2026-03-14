import './App.css'
import {ChatBox} from "./chat/components/ChatBox.jsx";
import "./assets/sass/layout.scss";
import Header from "./header/components/Header.jsx";
import SideBar from "./sidebar/components/SideBar.jsx";
import {useRef} from "react";

function App() {
  const refChatBox = useRef(null);
  const onClickPresetQuestion = (question) => {
    if (refChatBox.current) {
      refChatBox.current.sendPreset(question);
    }
  }

  return (
    <div>
      <Header />

      <div className="main">
        <div className="chat-panel">
          <div className="chat-header">
            <div className="chat-dot"></div>
            <div className="chat-header-title">Avatar virtuel — David Vander Elst</div>
            <div className="chat-header-sub" id="chat-status">En ligne</div>
          </div>
          <ChatBox ref={refChatBox}/>
        </div>

        <SideBar onClickPresetQuestion={onClickPresetQuestion} />
      </div>
    </div>
  );
}

export default App
