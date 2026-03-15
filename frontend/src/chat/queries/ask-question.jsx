import {getBackendUrl} from "../../configs/backend.config.js";

export const chatAskQuestion = async (q, sessId) => {
    const response = await fetch(
        getBackendUrl() + "/chat",
        {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ question: q, sessionId: sessId })
        }
    );

    const json = await response.json();

    return json.answer;
}