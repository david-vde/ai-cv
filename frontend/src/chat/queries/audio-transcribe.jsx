import {getBackendUrl} from "../../configs/backend.config.js";
import _ from "lodash";

export const transcribeAudio = async (formData) => {
  const response = await fetch(
    getBackendUrl() + "/audio-transcribe",
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

  return _.get(json, ["transcription"], "");
};