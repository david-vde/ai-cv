import { describe, it, expect, vi } from 'vitest';
import { getBackendUrl } from '../../configs/backend.config.js';
import { chatAskQuestion } from './ask-question.jsx';

const mockFetch = vi.fn();
global.fetch = mockFetch;

vi.mock('../../configs/backend.config.js', () => ({
    getBackendUrl: vi.fn()
}));

describe('chatAskQuestion', () => {
  it('returns the answer when everything goes well', async () => {
    getBackendUrl.mockReturnValue('http://fake-backend/api');
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ answer: 'Test response' })
    });

    const result = await chatAskQuestion('My question ?', 'session-123');
    expect(result).toBe('Test response');
    expect(getBackendUrl).toHaveBeenCalled();
    expect(mockFetch).toHaveBeenCalledWith(
      'http://fake-backend/api/chat',
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({ 'Accept': 'application/json', 'Content-Type': 'application/json' }),
        body: JSON.stringify({ question: 'My question ?', sessionId: 'session-123' })
      })
    );
  });

  it('throws an error if the response is not OK and contains an error message', async () => {
    getBackendUrl.mockReturnValue('http://fake-backend/api');
    mockFetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: 'Backend error' })
    });

    let error;
    try {
      await chatAskQuestion('My question ?', 'session-123');
    } catch (e) {
      error = e;
    }

    expect(error).toBeInstanceOf(Error);
    expect(error.message).toBe('Backend error');
    expect(getBackendUrl).toHaveBeenCalled();
    expect(mockFetch).toHaveBeenCalled();
  });

  it('throws a generic error if the response is not OK and has no error message', async () => {
    getBackendUrl.mockReturnValue('http://fake-backend/api');
    mockFetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({})
    });

    let error;
    try {
      await chatAskQuestion('My question ?', 'session-123');
    } catch (e) {
      error = e;
    }

    expect(error).toBeInstanceOf(Error);
    expect(error.message).toBe('Failed to fetch answer');
    expect(getBackendUrl).toHaveBeenCalled();
    expect(mockFetch).toHaveBeenCalled();
  });
});
