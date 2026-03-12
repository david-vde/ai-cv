import {backendConfig, getBackendUrl} from "../../configs/backend.config.js";

export const chatAskQuestion = async (q, sessId) => {
    console.log("chatAskQuestion q ", q);

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

export const helloWorld = async () => {

    const response = await fetch(getBackendUrl() + "/helloworld");

    console.log(await response.json());

}