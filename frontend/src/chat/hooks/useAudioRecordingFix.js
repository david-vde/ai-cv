import {useEffect, useRef, useCallback} from "react";

/**
 * Workaround for a race condition in DeepChat (v2.x) where clicking "submit"
 * while audio is still recording can produce an empty audio file.
 *
 * Root cause: DeepChat's internal RecordAudio.stop() calls MediaRecorder.stop()
 * but resolves its promise after only 10ms (hardcoded setTimeout). The browser's
 * "dataavailable" event — which carries the actual audio data — often fires later,
 * especially on mobile. As a result, the FormData sent to the connect handler
 * contains the empty placeholder file (new File([], "")).
 *
 * This hook patches MediaRecorder to independently capture each recorded audio blob
 * and exposes a function to retrieve it when the FormData file turns out to be empty.
 */
export function useAudioRecordingFix() {
  const lastBlobRef = useRef(null);
  const pendingResolveRef = useRef(null);

  useEffect(() => {
    const OriginalMediaRecorder = window.MediaRecorder;

    class PatchedMediaRecorder extends OriginalMediaRecorder {
      constructor(stream, options) {
        super(stream, options);
        this.addEventListener("dataavailable", (e) => {
          if (e.data && e.data.size > 0) {
            if (pendingResolveRef.current) {
              pendingResolveRef.current(e.data);
              pendingResolveRef.current = null;
            } else {
              lastBlobRef.current = e.data;
            }
          }
        });
      }
    }

    Object.setPrototypeOf(PatchedMediaRecorder, OriginalMediaRecorder);
    window.MediaRecorder = PatchedMediaRecorder;

    return () => {
      window.MediaRecorder = OriginalMediaRecorder;
      lastBlobRef.current = null;
      if (pendingResolveRef.current) {
        pendingResolveRef.current(null);
        pendingResolveRef.current = null;
      }
    };
  }, []);

  const getRecordedAudioBlob = useCallback((timeoutMs = 2000) => {
    if (lastBlobRef.current) {
      const blob = lastBlobRef.current;
      lastBlobRef.current = null;
      return Promise.resolve(blob);
    }

    return new Promise((resolve) => {
      pendingResolveRef.current = resolve;

      setTimeout(() => {
        if (pendingResolveRef.current) {
          pendingResolveRef.current = null;
          resolve(null);
        }
      }, timeoutMs);
    });
  }, []);

  return {getRecordedAudioBlob};
}

export function formDataHasEmptyFile(formData) {
  for (const [, value] of formData.entries()) {
    if (value instanceof File && value.size === 0) {
      return true;
    }
  }
  return false;
}

export function rebuildFormDataWithBlob(originalFormData, audioBlob) {
  const newFormData = new FormData();
  for (const [key, value] of originalFormData.entries()) {
    if (value instanceof File && value.size === 0) {
      newFormData.append(
        key,
        new File([audioBlob], value.name || "recording.wav", {type: audioBlob.type})
      );
    } else {
      newFormData.append(key, value);
    }
  }
  return newFormData;
}

