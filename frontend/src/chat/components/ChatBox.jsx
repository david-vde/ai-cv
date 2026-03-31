import React, {forwardRef, useEffect, useImperativeHandle, useRef, useState} from "react";
import {DeepChat} from "deep-chat-react";
import "../../assets/sass/chatbox.scss";
import {chatAskQuestion} from "../queries/ask-question.jsx";
import PreWrittenQuestions from "./PreWrittenQuestions.jsx";
import davidPicture from "../../assets/pictures/david-avatar.jpg";
import {useConfig} from "../../configs/context/ConfigContext.jsx";
import _ from "lodash";
import {useTranslation} from "react-i18next";
import {getChatHistory} from "../queries/get-history.jsx";
import {SyncLoader} from "react-spinners";
import {FaRotateLeft, FaTriangleExclamation} from "react-icons/fa6";
import {getChatBotSessionId, initNewChatBotSession} from "../services/chatBotSession.js";
import {transcribeAudio} from "../queries/audio-transcribe.jsx";
import {validateAudioFormData} from "../services/audioFormDataValidator.js";

const ChatBox = forwardRef((props, ref) => {
  const { i18n } = useTranslation();
  const [sessionId, setSessionId] = useState(getChatBotSessionId());
  const {onClickPresetQuestion} = props;

  const refDeepChat = useRef(null)
  const {configs} = useConfig();
  const [history, setHistory] = useState([])
  const [historyLoaded, setHistoryLoaded] = useState(false)
  const { t } = useTranslation();

  const bubbleUserStyle = {
    backgroundColor: "#1f3a2d",
    color: "#e6edf3",
  };

  // Small hack to modify the border radius in the Shadow DOM of DeepChat, since the library doesn't allow customizing it directly
  useEffect(() => {
    const deepChat = document.querySelector('deep-chat');
    if (!deepChat?.shadowRoot) return;

    const style = document.createElement('style');
    style.textContent = `
      img { border-radius: 50% !important; padding-top: 0 !important; }
    `;

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
  }, [i18n, sessionId]);

  useImperativeHandle(ref, () => ({
    sendPreset: (text) => {
      if (refDeepChat.current) {
        refDeepChat.current.submitUserMessage({ text })
      }
    }
  }))

  const onAudioTranscribed = (transcribedText) => {
    if (refDeepChat.current) {
      refDeepChat.current.addMessage({
        role: "user",
        text: transcribedText
      });
    }

    return {
      role: "user",
      text: transcribedText
    };
  }

  const onClickResetSession = () => {
    setSessionId(initNewChatBotSession());
  }

  const personName = _.get(configs, ['contact.firstname']) + " " + _.get(configs, ['contact.lastname']);

  return (
    <>
      <div className="chat-header">
        <div className="chat-dot"></div>
        <div className="chat-header-title">{ t("chatbot.virtualAvatar") } — {personName}</div>
        <div className="chat-header-reset" onClick={onClickResetSession}>{<FaRotateLeft title={t("chatbot.resetChat")}/>}</div>
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
                  microphone={{
                    files: { maxNumberOfFiles: 1 }
                  }}
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
                        margin: "40px 0 10px",
                        backgroundColor: "#0d1117",
                        borderTop: "1px solid #21262d",
                        borderRadius: "0px",
                        fontFamily: "'DM Sans', sans-serif",
                        fontSize: "14px",
                        padding: "5px 14px 5px",
                        transition: "border-color 0.15s",
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
                          top: "43px",
                          right: "4px",
                          filter: 'brightness(0) saturate(100%) invert(90%) sepia(0%) saturate(5564%) hue-rotate(207deg) brightness(100%) contrast(97%)'
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
                        bubble: bubbleUserStyle
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
                      let answer;

                      if (body instanceof FormData) {
                        const validatedFormData = await validateAudioFormData(body);

                        if (!validatedFormData) {
                          await signals.onResponse({ error: "L'audio n'a pas pu être capturé correctement. Réessayez." });
                          return;
                        }

                        const messages = refDeepChat.current.getMessages();
                        const lastIndex = messages.length - 1;
                        refDeepChat.current.updateMessage({
                          role: "user",
                          html: '',
                          files: []
                        }, lastIndex);

                        const transcribedText = await transcribeAudio(validatedFormData);
                        const newUserMessage = onAudioTranscribed(transcribedText);

                        answer = await chatAskQuestion({messages: [newUserMessage]}, sessionId, true);
                      } else {
                        answer = await chatAskQuestion(body, sessionId);
                      }

                      await signals.onResponse({text: answer});
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