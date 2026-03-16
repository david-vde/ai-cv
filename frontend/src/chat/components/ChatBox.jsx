import React, {forwardRef, useEffect, useImperativeHandle, useMemo, useRef} from "react";
import {DeepChat} from "deep-chat-react";
import "../../assets/sass/chatbox.scss";
import {chatAskQuestion} from "../queries/ask-question.jsx";
import PreWrittenQuestions from "./PreWrittenQuestions.jsx";
import davidPicture from "../../assets/pictures/david-avatar.png";

const ChatBox = forwardRef((props, ref) => {
  const {onClickPresetQuestion} = props;
  const sessionId = useMemo(() => crypto.randomUUID(), []);
  const refDeepChat = useRef(null)
  const history = [
    {
      role: "ai",
      text: "Bonjour et bienvenue sur l'avatar virtuel de **David Vander Elst**.\n\n" +
        "Posez-moi vos questions sur moi, mon parcours professionnel, mes attentes, ma vision du futur, ou tout autre sujet en lien avec ma carrière de développeur.\n\n" +
        "Je suis là pour vous aider à mieux me connaître et à évaluer si je suis le candidat idéal pour votre entreprise avant un entretien réel.\n\n" +
        "N'hésitez pas à me poser des questions précises ou à me demander des détails sur mes expériences passées.\n\n" +
        "Je suis ouvert à la discussion et prêt à partager mon parcours avec vous! 😊"
    },
  ];

  // Small hack to modify the border radius in the Shadow DOM of DeepChat, since the library doesn't allow to customize it directly
  useEffect(() => {
    const deepChat = document.querySelector('deep-chat');
    if (!deepChat?.shadowRoot) return;

    const style = document.createElement('style');
    style.textContent = `img { border-radius: 50% !important; padding-top: 0 !important; }`;
    deepChat.shadowRoot.appendChild(style);
  }, []);

  useImperativeHandle(ref, () => ({
    sendPreset: (text) => {
      if (refDeepChat.current) {
        refDeepChat.current.submitUserMessage({ text })
      }
    }
  }))

  return (
    <>
      <div className="chat-box-container">

        <div className="log-notice">
          <svg width="12" height="12" fill="currentColor" viewBox="0 0 16 16">
            <path d="M8 16A8 8 0 1 0 8 0a8 8 0 0 0 0 16zm.93-9.412-1 4.705c-.07.34.029.533.304.533.194 0 .487-.07.686-.246l-.088.416c-.287.346-.92.598-1.465.598-.703 0-1.002-.422-.808-1.319l.738-3.468c.064-.293.006-.399-.287-.47l-.451-.081.082-.381 2.29-.287zM8 5.5a1 1 0 1 1 0-2 1 1 0 0 1 0 2z"/>
          </svg>
          Les conversations sont enregistrées et consultées uniquement par David Vander Elst.
        </div>

        <DeepChat
          ref={refDeepChat}
          history={history}
          style={{
            border: "none",
            borderRadius: "0px",
            width: "100%",
            height: "550px",
            margin: 0,
            backgroundColor: "#0d1117"
          }}
          textInput={{
            placeholder: {
              text: "Posez-moi vos questions!"
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
            borderRadius: "12px",
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
                  borderRadius: "5px"
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
      </div>
      <PreWrittenQuestions onClickPresetQuestion={onClickPresetQuestion}/>
    </>
  );
});

export default ChatBox;