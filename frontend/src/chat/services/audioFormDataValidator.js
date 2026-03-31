const MAX_RETRIES = 5;
const RETRY_DELAY_MS = 150;

/**
 * Extracts and validates the audio file from a FormData object.
 *
 * Uses arrayBuffer() to force blob data materialization (avoids race conditions
 * with MediaRecorder not having finalized the blob when DeepChat fires the handler).
 *
 * Retries up to MAX_RETRIES times with a small delay if the buffer is empty,
 * then returns a clean FormData with the validated audio blob.
 *
 * @param {FormData} formData - The FormData from DeepChat containing the audio file.
 * @returns {Promise<FormData|null>} A new FormData with the validated audio, or null if invalid.
 */
export async function validateAudioFormData(formData) {
  const audioFile = formData.get('files');

  if (!audioFile) {
    return null;
  }

  let buffer = await audioFile.arrayBuffer();

  for (let attempt = 0; attempt < MAX_RETRIES && buffer.byteLength === 0; attempt++) {
    await new Promise(resolve => setTimeout(resolve, RETRY_DELAY_MS));

    const retryFile = formData.get('files');
    if (retryFile) {
      buffer = await retryFile.arrayBuffer();
    }
  }

  if (buffer.byteLength === 0) {
    return null;
  }

  const mimeType = audioFile.type || 'audio/webm';
  const fileName = audioFile.name || 'audio.webm';

  const validatedBlob = new Blob([buffer], { type: mimeType });
  const validatedFormData = new FormData();
  validatedFormData.append('files', validatedBlob, fileName);

  return validatedFormData;
}

