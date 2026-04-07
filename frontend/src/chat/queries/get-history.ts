import {getBackendUrl} from "../../configs/backend.config.ts";
import _ from "lodash";
import {ChatMessage} from "../types/ChatMessage.interface.ts";
import {GetHistoryResponse} from "../types/responses/GetHistoryResponse.interface.ts";

export const getChatHistory = async (sessId): Promise<ChatMessage[]> => {
  const response = await fetch(
    getBackendUrl() + "/chat-history/" + sessId,
    {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    }
  );

  const json: GetHistoryResponse = await response.json();

  if (!response.ok) {
    throw new Error(json.error || 'Failed to retrieve chat history');
  }

  let returnData = [];

  _.forEach(json, (element) => {
    returnData.push({
      role: element.sender,
      text: element.message
    });
  })

  return returnData;
}