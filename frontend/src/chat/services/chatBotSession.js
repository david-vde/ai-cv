import { v4 as uuid4 } from 'uuid';

export const initNewChatBotSession = () => {
  const newId = uuid4();
  localStorage.setItem('chat_session_id', newId);
  return newId;
}

export const getChatBotSessionId = () => {
  const currentSessionId = localStorage.getItem('chat_session_id');

  if (typeof currentSessionId !== 'string') {
    return initNewChatBotSession();
  }

  return currentSessionId;
}