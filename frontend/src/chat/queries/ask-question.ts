import {getBackendUrl} from "../../configs/backend.config.ts";
import {ChatMessages} from "../types/ChatMessage.interface.ts";
import {ChatResponse} from "../types/responses/ChatResponse.interface.ts";

export const chatAskQuestion = async (q: ChatMessages, sessId: string, transcribed: boolean = false): Promise<string> => {
    const response = await fetch(
        getBackendUrl() + "/chat",
        {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                question: q,
                sessionId: sessId,
                transcribed: transcribed })
        }
    );

    const json: ChatResponse = await response.json();

    if (!response.ok) {
        throw new Error(json.error || 'Failed to fetch answer');
    }

    return json.answer;
}