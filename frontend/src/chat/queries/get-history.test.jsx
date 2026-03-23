import { describe, it, expect, vi } from 'vitest';
import { getBackendUrl } from '../../configs/backend.config.js';
import { getChatHistory } from './get-history.jsx';

const mockFetch = vi.fn();
global.fetch = mockFetch;

vi.mock('../../configs/backend.config.js', () => ({
    getBackendUrl: vi.fn()
}));

describe('getChatHistory', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getBackendUrl.mockReturnValue('http://fake-backend/api');
  });

  it('should call fetch with the correct URL and options', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ([])
    });

    await getChatHistory('session-abc');

    expect(getBackendUrl).toHaveBeenCalled();
    expect(mockFetch).toHaveBeenCalledWith(
      'http://fake-backend/api/chat-history/session-abc',
      expect.objectContaining({
        method: 'GET',
        headers: expect.objectContaining({
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        })
      })
    );
  });

  it('should return mapped chat history when response is OK', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ([
        { sender: 'user', message: 'Hello' },
        { sender: 'assistant', message: 'Hi there!' }
      ])
    });

    const result = await getChatHistory('session-123');

    expect(result).toEqual([
      { role: 'user', text: 'Hello' },
      { role: 'assistant', text: 'Hi there!' }
    ]);
  });

  it('should return an empty array when history is empty', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ([])
    });

    const result = await getChatHistory('session-empty');

    expect(result).toEqual([]);
  });

  it('should correctly map sender to role and message to text for each element', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ([
        { sender: 'bot', message: 'Welcome' },
        { sender: 'user', message: 'Thanks' },
        { sender: 'bot', message: 'How can I help?' }
      ])
    });

    const result = await getChatHistory('session-456');

    expect(result).toHaveLength(3);
    expect(result[0]).toEqual({ role: 'bot', text: 'Welcome' });
    expect(result[1]).toEqual({ role: 'user', text: 'Thanks' });
    expect(result[2]).toEqual({ role: 'bot', text: 'How can I help?' });
  });

  it('should throw an error with the backend error message when response is not OK', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: 'Session not found' })
    });

    await expect(getChatHistory('session-bad')).rejects.toThrow('Session not found');
  });

  it('should throw a default error message when response is not OK and no error field is present', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({})
    });

    await expect(getChatHistory('session-fail')).rejects.toThrow('Failed to retrieve chat history');
  });
});

