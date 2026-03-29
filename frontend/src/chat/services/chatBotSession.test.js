import { beforeEach } from 'vitest';
import { initNewChatBotSession, getChatBotSessionId } from './chatBotSession';

vi.mock('uuid', () => ({
  v4: vi.fn(),
}));

import { v4 as uuid4 } from 'uuid';

const mockLocalStorage = (() => {
  let store = {};
  return {
    getItem: vi.fn((key) => store[key] ?? null),
    setItem: vi.fn((key, value) => { store[key] = value; }),
    clear: () => { store = {}; },
  };
})();

Object.defineProperty(globalThis, 'localStorage', { value: mockLocalStorage });

beforeEach(() => {
  vi.clearAllMocks();
  mockLocalStorage.clear();
});

describe('initNewChatBotSession', () => {
  it('should generate a new uuid and store it in localStorage', () => {
    uuid4.mockReturnValue('fake-uuid-1234');

    const result = initNewChatBotSession();

    expect(result).toBe('fake-uuid-1234');
    expect(uuid4).toHaveBeenCalledOnce();
    expect(mockLocalStorage.setItem).toHaveBeenCalledWith('chat_session_id', 'fake-uuid-1234');
  });

  it('should return a different id on each call', () => {
    uuid4.mockReturnValueOnce('first-uuid').mockReturnValueOnce('second-uuid');

    const first = initNewChatBotSession();
    const second = initNewChatBotSession();

    expect(first).toBe('first-uuid');
    expect(second).toBe('second-uuid');
  });
});

describe('getChatBotSessionId', () => {
  it('should return existing session id from localStorage', () => {
    mockLocalStorage.getItem.mockReturnValue('existing-session-id');

    const result = getChatBotSessionId();

    expect(result).toBe('existing-session-id');
    expect(mockLocalStorage.getItem).toHaveBeenCalledWith('chat_session_id');
    expect(uuid4).not.toHaveBeenCalled();
  });

  it('should create a new session when localStorage does not return string', () => {
    mockLocalStorage.getItem.mockReturnValue(null);
    uuid4.mockReturnValue('new-uuid');

    const result = getChatBotSessionId();

    expect(result).toBe('new-uuid');
    expect(mockLocalStorage.setItem).toHaveBeenCalledWith('chat_session_id', 'new-uuid');
  });
});
