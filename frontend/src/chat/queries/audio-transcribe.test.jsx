import { expect, beforeEach } from 'vitest';
import { getBackendUrl } from '../../configs/backend.config.js';
import { transcribeAudio } from './audio-transcribe.jsx';

const mockFetch = vi.fn();
global.fetch = mockFetch;

vi.mock('../../configs/backend.config.js', () => ({
    getBackendUrl: vi.fn()
}));

beforeEach(() => {
  mockFetch.mockClear();
  getBackendUrl.mockClear();
});

describe('transcribeAudio', () => {
  it('should return the transcription when the response is OK', async () => {
    getBackendUrl.mockReturnValue('http://fake-backend/api');
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ transcription: 'Hello world' })
    });

    const formData = new FormData();
    const result = await transcribeAudio(formData);

    expect(result).toBe('Hello world');
    expect(getBackendUrl).toHaveBeenCalled();
    expect(mockFetch).toHaveBeenCalledWith(
      'http://fake-backend/api/audio-transcribe',
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({ 'Accept': 'application/json' }),
        body: formData
      })
    );
  });

  it('should throw an error with the backend message when the response is not OK', async () => {
    getBackendUrl.mockReturnValue('http://fake-backend/api');
    mockFetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: 'Transcription failed' })
    });

    let error;
    try {
      await transcribeAudio(new FormData());
    } catch (e) {
      error = e;
    }

    expect(error).toBeInstanceOf(Error);
    expect(error.message).toBe('Transcription failed');
  });
});

