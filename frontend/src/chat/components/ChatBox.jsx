import React, {forwardRef, useImperativeHandle, useMemo, useRef} from "react";
import {DeepChat} from "deep-chat-react";
import "../../assets/sass/chatbox.scss";
import {chatAskQuestion} from "../queries/ask-question.jsx";

export const ChatBox = forwardRef((props, ref) => {
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

  useImperativeHandle(ref, () => ({
    sendPreset: (text) => {
      if (refDeepChat.current) {
        refDeepChat.current.submitUserMessage({ text })
      }
    }
  }))


  const sendPreset = (text) => {
    if (refDeepChat.current) {
      refDeepChat.current.submitUserMessage({ text })
    }
  }

  return (
    <>
      <div className="chat-box-container">
        <DeepChat
          ref={refDeepChat}
          history={history}
          style={{
            border: "none",
            borderRadius: "0px",
            width: "672px",
            height: "700px",
            margin: 0,
            backgroundColor: "#0d1117"
          }}
          textInput={{
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
                },
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
      <div className="cta-row">
        <span className="cta-chip" onClick="sendCTA('Quel est ton parcours professionnel ?')">🎯 Parcours</span>
        <span className="cta-chip" onClick="sendCTA('Quelles sont tes prétentions salariales ?')">💶 Salaire</span>
        <span className="cta-chip" onClick="sendCTA('Tu es disponible quand ?')">📅 Disponibilité</span>
        <span className="cta-chip" onClick="sendCTA('Pourquoi tu cherches un nouveau poste ?')">🔍 Motivation</span>
        <span className="cta-chip" onClick="sendCTA('Tu travailles plutôt en remote ou en présentiel ?')">🏠 Remote/Présentiel</span>
        <span className="cta-chip"
              onClick="sendCTA('Parle-moi de tes projets les plus marquants.')">💡 Projets</span>
      </div>
    </>
  );
});