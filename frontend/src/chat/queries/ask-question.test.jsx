import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getBackendUrl } from '../../configs/backend.config.js';
import { chatAskQuestion, voiceChatAskQuestion } from './ask-question.jsx';

const mockFetch = vi.fn();
global.fetch = mockFetch;

vi.mock('../../configs/backend.config.js', () => ({
    getBackendUrl: vi.fn()
}));

beforeEach(() => {
  mockFetch.mockClear();
  getBackendUrl.mockClear();
});

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

describe('voiceChatAskQuestion', () => {
  it('returns the answer when everything goes well', async () => {
    getBackendUrl.mockReturnValue('http://fake-backend/api');
    const formData = new FormData();
    formData.append('audio', new Blob(['fake audio'], { type: 'audio/webm' }));

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ answer: 'Voice response' })
    });

    const result = await voiceChatAskQuestion(formData, 'session-456');

    expect(result).toBe('Voice response');
    expect(getBackendUrl).toHaveBeenCalled();
    expect(mockFetch).toHaveBeenCalledWith(
      'http://fake-backend/api/voice-chat',
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({ 'Accept': 'application/json' }),
        body: formData
      })
    );
    expect(formData.get('sessionId')).toBe('session-456');
  });

  it('returns undefined if formData is not an instance of FormData', async () => {
    const result = await voiceChatAskQuestion('not a FormData', 'session-456');

    expect(result).toBeUndefined();
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it('throws an error if the response is not OK and contains an error message', async () => {
    getBackendUrl.mockReturnValue('http://fake-backend/api');
    const formData = new FormData();

    mockFetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: 'Voice backend error' })
    });

    let error;
    try {
      await voiceChatAskQuestion(formData, 'session-456');
    } catch (e) {
      error = e;
    }

    expect(error).toBeInstanceOf(Error);
    expect(error.message).toBe('Voice backend error');
  });

  it('throws a generic error if the response is not OK and has no error message', async () => {
    getBackendUrl.mockReturnValue('http://fake-backend/api');
    const formData = new FormData();

    mockFetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({})
    });

    let error;
    try {
      await voiceChatAskQuestion(formData, 'session-456');
    } catch (e) {
      error = e;
    }

    expect(error).toBeInstanceOf(Error);
    expect(error.message).toBe('Failed to fetch answer');
  });
});

