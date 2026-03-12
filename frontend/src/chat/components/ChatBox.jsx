import React, { useMemo } from "react";
import { DeepChat } from "deep-chat-react";
import "../../assets/sass/chatbox.scss";
import {chatAskQuestion} from "../queries/ask-question.jsx";

export const ChatBox = () => {

    const sessionId = useMemo(() => crypto.randomUUID(), []);

    const history = [
        {
            role: "ai",
            text: "Bonjour et bienvenue sur l'avatar virtuel de **David Vander Elst**.\n\n" +
                "Posez-moi vos questions sur moi, mon parcours professionnel, mes attentes, ma vision du futur, ou tout autre sujet en lien avec ma carrière de développeur.\n\n" +
                "Je suis là pour vous aider à mieux me connaître et à évaluer si je suis le candidat idéal pour votre entreprise avant un entretien réel.\n\n" +
                "N'hésitez pas à me poser des questions précises ou à me demander des détails sur mes expériences passées.\n\n" +
                "Je suis ouvert à la discussion et prêt à partager mon parcours avec vous! 😊" },
    ];

    return (
        <div className="chat-box-container">
            <h1>Virtual David Chatbox</h1>
            <DeepChat
                history={history}
                style={{ borderRadius: "10px", width: "800px" }}
                connect={{
                    handler: async (body, signals) => {
                        const answer = await chatAskQuestion(body, sessionId);
                        signals.onResponse({ text: answer });
                    }
                }}
            />
        </div>
    );
};