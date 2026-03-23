import {getBackendUrl} from "../../configs/backend.config.js";
import _ from "lodash";

export const getChatHistory = async (sessId) => {
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

  const json = await response.json();

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