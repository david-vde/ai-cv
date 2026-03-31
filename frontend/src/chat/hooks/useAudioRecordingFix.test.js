import {renderHook, act} from "@testing-library/react";
import {useAudioRecordingFix, formDataHasEmptyFile, rebuildFormDataWithBlob} from "./useAudioRecordingFix.js";

class MockMediaRecorder extends EventTarget {
  constructor(stream, options) {
    super();
    this.stream = stream;
    this.options = options;
    this.state = "inactive";
  }

  start() { this.state = "recording"; }
  stop() { this.state = "inactive"; }
  pause() { this.state = "paused"; }
  resume() { this.state = "recording"; }

  static isTypeSupported(type) { return true; }
}

beforeAll(() => {
  window.MediaRecorder = MockMediaRecorder;
});

afterAll(() => {
  delete window.MediaRecorder;
});

describe("formDataHasEmptyFile", () => {
  it("should return true when FormData contains a File with size 0", () => {
    const fd = new FormData();
    fd.append("files", new File([], ""));
    expect(formDataHasEmptyFile(fd)).toBe(true);
  });

  it("should return false when FormData contains a File with content", () => {
    const fd = new FormData();
    fd.append("files", new File(["audio-data"], "recording.wav"));
    expect(formDataHasEmptyFile(fd)).toBe(false);
  });

  it("should return false when FormData has no File entries", () => {
    const fd = new FormData();
    fd.append("message", "hello");
    expect(formDataHasEmptyFile(fd)).toBe(false);
  });

  it("should return true when at least one File is empty among multiple entries", () => {
    const fd = new FormData();
    fd.append("files", new File(["data"], "file1.wav"));
    fd.append("files", new File([], ""));
    expect(formDataHasEmptyFile(fd)).toBe(true);
  });
});

describe("rebuildFormDataWithBlob", () => {
  it("should replace empty files with the provided blob", () => {
    const fd = new FormData();
    fd.append("files", new File([], "placeholder.wav"));
    fd.append("message1", "some message");

    const audioBlob = new Blob(["real-audio-data"], {type: "audio/wav"});
    const result = rebuildFormDataWithBlob(fd, audioBlob);

    const files = result.getAll("files");
    expect(files).toHaveLength(1);
    expect(files[0]).toBeInstanceOf(File);
    expect(files[0].size).toBeGreaterThan(0);
    expect(files[0].type).toBe("audio/wav");

    expect(result.get("message1")).toBe("some message");
  });

  it("should not replace files that already have content", () => {
    const fd = new FormData();
    fd.append("files", new File(["existing-data"], "existing.wav", {type: "audio/wav"}));

    const audioBlob = new Blob(["new-audio"], {type: "audio/wav"});
    const result = rebuildFormDataWithBlob(fd, audioBlob);

    const files = result.getAll("files");
    expect(files).toHaveLength(1);
    expect(files[0].name).toBe("existing.wav");
  });

  it("should use fallback name 'recording.wav' when original file has no name", () => {
    const fd = new FormData();
    fd.append("files", new File([], ""));

    const audioBlob = new Blob(["data"], {type: "audio/webm"});
    const result = rebuildFormDataWithBlob(fd, audioBlob);

    const file = result.get("files");
    expect(file.name).toBe("recording.wav");
  });
});

describe("useAudioRecordingFix", () => {
  let OriginalMediaRecorder;

  beforeEach(() => {
    OriginalMediaRecorder = window.MediaRecorder;
  });

  afterEach(() => {
    window.MediaRecorder = OriginalMediaRecorder;
  });

  it("should patch window.MediaRecorder on mount and restore on unmount", () => {
    const {unmount} = renderHook(() => useAudioRecordingFix());

    expect(window.MediaRecorder).not.toBe(OriginalMediaRecorder);
    expect(window.MediaRecorder.isTypeSupported).toBe(OriginalMediaRecorder.isTypeSupported);

    unmount();

    expect(window.MediaRecorder).toBe(OriginalMediaRecorder);
  });

  it("should resolve immediately with stored blob when dataavailable fires before getRecordedAudioBlob", async () => {
    const {result} = renderHook(() => useAudioRecordingFix());

    const fakeStream = {getTracks: () => [{stop: vi.fn()}]};
    const recorder = new window.MediaRecorder(fakeStream);

    const fakeBlob = new Blob(["fake-audio"], {type: "audio/wav"});
    const event = new Event("dataavailable");
    Object.defineProperty(event, "data", {value: fakeBlob});
    recorder.dispatchEvent(event);

    let blob;
    await act(async () => {
      blob = await result.current.getRecordedAudioBlob();
    });

    expect(blob).toBe(fakeBlob);
  });

  it("should wait and resolve with blob when dataavailable fires after getRecordedAudioBlob", async () => {
    const {result} = renderHook(() => useAudioRecordingFix());

    const fakeStream = {getTracks: () => [{stop: vi.fn()}]};
    const recorder = new window.MediaRecorder(fakeStream);

    let blobPromise;
    act(() => {
      blobPromise = result.current.getRecordedAudioBlob(2000);
    });

    const fakeBlob = new Blob(["fake-audio"], {type: "audio/wav"});
    const event = new Event("dataavailable");
    Object.defineProperty(event, "data", {value: fakeBlob});
    recorder.dispatchEvent(event);

    const blob = await blobPromise;
    expect(blob).toBe(fakeBlob);
  });

  it("should resolve with null after timeout if no audio data arrives", async () => {
    vi.useFakeTimers();
    const {result} = renderHook(() => useAudioRecordingFix());

    let blobPromise;
    act(() => {
      blobPromise = result.current.getRecordedAudioBlob(500);
    });

    await act(async () => {
      vi.advanceTimersByTime(600);
    });

    const blob = await blobPromise;
    expect(blob).toBeNull();
    vi.useRealTimers();
  });

  it("should ignore dataavailable events with empty data", async () => {
    vi.useFakeTimers();
    const {result} = renderHook(() => useAudioRecordingFix());

    const fakeStream = {getTracks: () => [{stop: vi.fn()}]};
    const recorder = new window.MediaRecorder(fakeStream);

    const emptyEvent = new Event("dataavailable");
    Object.defineProperty(emptyEvent, "data", {value: new Blob([])});
    recorder.dispatchEvent(emptyEvent);

    let blobPromise;
    act(() => {
      blobPromise = result.current.getRecordedAudioBlob(200);
    });

    await act(async () => {
      vi.advanceTimersByTime(300);
    });

    const blob = await blobPromise;
    expect(blob).toBeNull();
    vi.useRealTimers();
  });

  it("should resolve pending promise with null on unmount", async () => {
    const {result, unmount} = renderHook(() => useAudioRecordingFix());

    let blobPromise;
    act(() => {
      blobPromise = result.current.getRecordedAudioBlob(5000);
    });

    unmount();

    const blob = await blobPromise;
    expect(blob).toBeNull();
  });
});


