import {getBackendUrl} from "../../configs/backend.config.ts";
import _ from "lodash";
import {AudioTranscribeResponse} from "../types/responses/AudioTranscribeResponse.interface.ts";

export const transcribeAudio = async (formData: FormData): Promise<string> => {
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

  const json: AudioTranscribeResponse = await response.json();

  if (!response.ok) {
    throw new Error(json.error || 'Failed to fetch answer');
  }

  return _.get(json, ["transcription"], "");
};