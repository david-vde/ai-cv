import React, {forwardRef, useEffect, useImperativeHandle, useMemo, useRef, useState} from "react";
import {DeepChat} from "deep-chat-react";
import "../../assets/sass/chatbox.scss";
import {chatAskQuestion} from "../queries/ask-question.jsx";
import PreWrittenQuestions from "./PreWrittenQuestions.jsx";
import davidPicture from "../../assets/pictures/david-avatar.png";
import {useConfig} from "../../configs/context/ConfigContext.jsx";
import _ from "lodash";
import {useTranslation} from "react-i18next";
import {getChatHistory} from "../queries/get-history.jsx";
import {SyncLoader} from "react-spinners";
import {FaTriangleExclamation} from "react-icons/fa6";
import { v4 as uuid4 } from 'uuid';

const ChatBox = forwardRef((props, ref) => {
  const { i18n } = useTranslation();

  const {onClickPresetQuestion} = props;
  const sessionId = useMemo(() => {
    const savedId = localStorage.getItem('chat_session_id');
    if (savedId) return savedId;

    const newId = uuid4();
    localStorage.setItem('chat_session_id', newId);
    return newId;
  }, []);
  const refDeepChat = useRef(null)
  const {configs} = useConfig();
  const [history, setHistory] = useState([])
  const [historyLoaded, setHistoryLoaded] = useState(false)
  const { t } = useTranslation();

  // Small hack to modify the border radius in the Shadow DOM of DeepChat, since the library doesn't allow to customize it directly
  useEffect(() => {
    const deepChat = document.querySelector('deep-chat');
    if (!deepChat?.shadowRoot) return;

    const style = document.createElement('style');
    style.textContent = `img { border-radius: 50% !important; padding-top: 0 !important; }`;
    deepChat.shadowRoot.appendChild(style);
  }, []);

  useEffect(() => {
    (async () => {
      setHistoryLoaded(false);
      let newHistory = await getChatHistory(sessionId);

      if (!_.isArray(newHistory)) {
        newHistory = [];
      }

      newHistory.unshift({
        role: "chatbot",
        text: t("chatbot.helloMessage")
      })

      setHistory(newHistory);
      setHistoryLoaded(true);
    })()
  }, [sessionId, i18n]);

  useImperativeHandle(ref, () => ({
    sendPreset: (text) => {
      if (refDeepChat.current) {
        refDeepChat.current.submitUserMessage({ text })
      }
    }
  }))

  const personName = _.get(configs, ['contact.firstname']) + " " + _.get(configs, ['contact.lastname']);

  return (
    <>
      <div className="chat-header">
        <div className="chat-dot"></div>
        <div className="chat-header-title">{ t("chatbot.virtualAvatar") } — {personName}</div>
        <div className="chat-header-sub" id="chat-status">{ t("chatbot.status.online") }</div>
      </div>
      <div className="chat-box-container">
        {
          historyLoaded
            ?
              <>
                <div className="log-notice">
                  <FaTriangleExclamation style={{marginRight: "8px", color: "#ff9933"}} />&nbsp;
                  { t("chatbot.messageLogWarning", {personName: personName}) }
                </div>
                <DeepChat
                  ref={refDeepChat}
                  history={history}
                  style={{
                    border: "none",
                    borderRadius: "0px",
                    width: "100%",
                    display: "flex",
                    height: "clamp(350px, 60vh, 550px)",
                    margin: 0,
                    backgroundColor: "#0d1117"
                  }}
                  textInput={{
                    placeholder: {
                      text: t("chatbot.placeholder")
                    },
                    styles: {
                      container: {
                        flex: "1",
                        margin: 0,
                        backgroundColor: "#0d1117",
                        borderTop: "1px solid #21262d",
                        borderRadius: "0px",
                        fontFamily: "'DM Sans', sans-serif",
                        fontSize: "14px",
                        padding: "9px 14px",
                        transition: "border-color 0.15s",
                        display: "flex",
                        color: "#e6edf3",
                        outline: "none"
                      },
                      focus: {
                        borderColor: "#00d9a6"
                      }
                    }
                  }}
                  submitButtonStyles={{
                    submit: {
                      container: {
                        default: {
                          width: "36px",
                          height: "36px",
                          top: "4px",
                          right: "4px"
                        }
                      }
                    }
                  }}
                  submitUserMessage={{
                    button: true,
                    enterKey: true
                  }}
                  avatars={{
                    ai: {
                      src: davidPicture,
                    }
                  }}
                  chatStyle={{
                    backgroundColor: "#0d1117",
                    border: "1px solid #21262d",
                    borderRadius: "12px"
                  }}
                  messageStyles={{
                    default: {
                      shared: {
                        bubble: {
                          color: "#e6edf3",
                          fontFamily: "'DM Sans', sans-serif",
                          fontSize: "14px",
                        },
                        outerContainer: {
                          backgroundColor: "#0d1117",
                          marginTop: "12px"
                        },
                      },
                      ai: {
                        bubble: {
                          backgroundColor: "#161b22",
                          color: "#e6edf3",
                          borderRadius: "5px",
                          maxWidth: "100%",
                          width: "100%"
                        }
                      },
                      user: {
                        bubble: {
                          backgroundColor: "#1f3a2d",
                          color: "#e6edf3",
                        },
                      },
                    },
                    error: {
                      shared: {
                        bubble: {
                          backgroundColor: "#2d1b1b",
                          color: "#ff7b72",
                        },
                      },
                    },
                  }}
                  connect={{
                    handler: async (body, signals) => {
                      const answer = await chatAskQuestion(body, sessionId);
                      signals.onResponse({text: answer});
                    }
                  }}
                />
              </>
            : <div style={{padding: "20px"}}>
                <SyncLoader loading={true} color="#36d7b7" size={15} />
              </div>
        }

      </div>
      <PreWrittenQuestions onClickPresetQuestion={onClickPresetQuestion}/>
    </>
  );
});

export default ChatBox;