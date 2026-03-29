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

    if (!response.ok) {
        throw new Error(json.error || 'Failed to fetch answer');
    }

    return json.answer;
}

export const voiceChatAskQuestion = async (formData, sessId) => {
  if (!(formData instanceof FormData)) {
    return;
  }

  formData.append('sessionId', sessId);

  const response = await fetch(
    getBackendUrl() + "/voice-chat",
    {
      method: 'POST',
      headers: {
        'Accept': 'application/json'
      },
      body: formData
    }
  );

  const json = await response.json();

  if (!response.ok) {
    throw new Error(json.error || 'Failed to fetch answer');
  }

  return json.answer;
}