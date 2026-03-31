import { describe, it, expect, vi, beforeEach } from 'vitest';
import { validateAudioFormData } from './audioFormDataValidator.js';

describe('validateAudioFormData', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('should return null when FormData has no files entry', async () => {
    const formData = new FormData();
    const result = await validateAudioFormData(formData);
    expect(result).toBeNull();
  });

  it('should return a valid FormData when the audio file has content', async () => {
    const audioContent = new Uint8Array([1, 2, 3, 4, 5]);
    const blob = new Blob([audioContent], { type: 'audio/webm' });
    const file = new File([blob], 'audio.webm', { type: 'audio/webm' });

    const formData = new FormData();
    formData.append('files', file);

    const result = await validateAudioFormData(formData);

    expect(result).toBeInstanceOf(FormData);

    const validatedFile = result.get('files');
    expect(validatedFile).toBeTruthy();
    expect(validatedFile.size).toBe(5);
    expect(validatedFile.type).toBe('audio/webm');
  });

  it('should return null when the audio file is empty after all retries', async () => {
    const emptyBlob = new Blob([], { type: 'audio/webm' });
    const file = new File([emptyBlob], 'audio.webm', { type: 'audio/webm' });

    const formData = new FormData();
    formData.append('files', file);

    const result = await validateAudioFormData(formData);

    expect(result).toBeNull();
  });

  it('should use default mime type and file name when not provided', async () => {
    const audioContent = new Uint8Array([10, 20, 30]);
    const blob = new Blob([audioContent]);

    const formData = new FormData();
    formData.append('files', blob);

    const result = await validateAudioFormData(formData);

    expect(result).toBeInstanceOf(FormData);

    const validatedFile = result.get('files');
    expect(validatedFile).toBeTruthy();
    expect(validatedFile.size).toBe(3);
  });

  it('should succeed on retry when audio becomes available', async () => {
    const emptyBlob = new Blob([], { type: 'audio/webm' });
    const file = new File([emptyBlob], 'audio.webm', { type: 'audio/webm' });

    const formData = new FormData();
    formData.append('files', file);

    let callCount = 0;
    vi.spyOn(formData, 'get').mockImplementation(() => {
      callCount++;
      if (callCount <= 1) {
        return file;
      }
      const audioContent = new Uint8Array([1, 2, 3]);
      return new File([audioContent], 'audio.webm', { type: 'audio/webm' });
    });

    const result = await validateAudioFormData(formData);

    expect(result).toBeInstanceOf(FormData);
    const validatedFile = result.get('files');
    expect(validatedFile.size).toBe(3);
  });

  it('should preserve the original file name', async () => {
    const audioContent = new Uint8Array([1, 2]);
    const file = new File([audioContent], 'my-recording.ogg', { type: 'audio/ogg' });

    const formData = new FormData();
    formData.append('files', file);

    const result = await validateAudioFormData(formData);

    expect(result).toBeInstanceOf(FormData);
    const validatedFile = result.get('files');
    expect(validatedFile.name).toBe('my-recording.ogg');
    expect(validatedFile.type).toBe('audio/ogg');
  });
});


