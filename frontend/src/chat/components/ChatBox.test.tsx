import React, {
  useImperativeHandle as mockedUseImperativeHandle,
  useState as mockedUseState
} from "react";
import {render, screen} from "@testing-library/react";
import {useConfig as mockedUseConfig} from "../../configs/context/ConfigContext.tsx";
import {getChatBotSessionId as mockedGetChatBotSessionId, initNewChatBotSession as mockedInitNewChatBotSession} from "../services/chatBotSession.ts";
import {chatAskQuestion as mockedChatAskQuestion} from "../queries/ask-question.js";
import {transcribeAudio as mockedTranscribeAudio} from "../queries/audio-transcribe.ts";
import _ from "lodash";
import ChatBox from "./ChatBox.jsx";

const mockSubmitUserMessage = vi.fn();
const mockAddMessage = vi.fn();
const mockGetMessages = vi.fn();
const mockUpdateMessage = vi.fn();
const mockCaptureConnect = vi.fn();
const mockToggleLoading = vi.fn();

const deepChatRef = { current: { submitUserMessage: mockSubmitUserMessage, addMessage: mockAddMessage, getMessages: mockGetMessages, updateMessage: mockUpdateMessage } };
const loadingBubbleRef = { current: { toggle: mockToggleLoading } };

vi.mock('../../configs/context/ConfigContext', () => ({
    useConfig: vi.fn() }
));

vi.mock("../services/chatBotSession.ts", () => ({
  getChatBotSessionId: vi.fn(),
  initNewChatBotSession: vi.fn()
}));

vi.mock("react", async () => {
  const actual = await vi.importActual("react");
  let useRefCallIndex = 0;
  return {
    ...actual,
    forwardRef: vi.fn(Component => Component),
    useEffect: vi.fn((fn) => fn()),
    useImperativeHandle: vi.fn(),
    useRef: vi.fn(() => {
      const refs = [deepChatRef, loadingBubbleRef];
      const ref = refs[useRefCallIndex % refs.length];
      useRefCallIndex++;
      return ref;
    }),
    useState: vi.fn()
  };
});

vi.mock("../queries/ask-question.ts", () => ({
  chatAskQuestion: vi.fn()
}));

vi.mock("../queries/get-history.ts", () => ({
  getChatHistory: vi.fn()
}));

vi.mock("./PreWrittenQuestions.jsx", () => ({
  default: () => <div data-testid="prewritten-questions">PreWrittenQuestions</div>
}));

vi.mock("deep-chat-react", () => ({
  DeepChat: ({ history, textInput, connect }) => {
    if (connect) mockCaptureConnect(connect);
    return (
      <div data-testid="deep-chat">
        <div data-testid="history-values">{JSON.stringify(history)}</div>
        <div data-testid="placeholder-value">{textInput?.placeholder?.text}</div>
      </div>
    );
  }
}));

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key) => key + " - translated",
    i18n: {}
  })
}));

vi.mock("react-spinners", () => ({
  SyncLoader: () => <div data-testid="sync-loader">SyncLoader</div>
}));

vi.mock("react-icons/fa6", () => ({
  FaTriangleExclamation: () => <div data-testid="fa-triangle-exclamation">FaTriangleExclamation</div>,
  FaRotateLeft: () => <div data-testid="fa-rotate-left">FaRotateLeft</div>
}));

vi.mock("../queries/audio-transcribe.ts", () => ({
  transcribeAudio: vi.fn()
}));

const mockGetRecordedAudioBlob = vi.fn();

vi.mock("../hooks/useAudioRecordingFix.ts", () => ({
  useAudioRecordingFix: () => ({ getRecordedAudioBlob: mockGetRecordedAudioBlob }),
  formDataHasEmptyFile: (fd) => {
    for (const [, value] of fd.entries()) {
      if (value instanceof File && value.size === 0) return true;
    }
    return false;
  },
  rebuildFormDataWithBlob: (fd, blob) => {
    const newFd = new FormData();
    for (const [key, value] of fd.entries()) {
      if (value instanceof File && value.size === 0) {
        newFd.append(key, new File([blob], value.name || "recording.wav", { type: blob.type }));
      } else {
        newFd.append(key, value);
      }
    }
    return newFd;
  }
}));

function mockUseConfig() {
  mockedUseConfig.mockImplementation(() => ({
    configs: {
      'contact.firstname': 'John',
      'contact.lastname': 'Doe'
    },
    loading: false
  }));
}

function mockUseState(states) {
  _.forEach(states, (state, key) => {
    mockedUseState.mockImplementationOnce(() => [state.initialValue, state.setter])
  })
}

beforeEach(() => {
  mockUseConfig();
  mockedGetChatBotSessionId.mockReturnValue("existing-session-id");
  mockedInitNewChatBotSession.mockReturnValue("new-session-id");
});

describe("ChatBox - rendering", () => {
  it("renders DeepChat with history and placeholder props, PreWrittenQuestions, matches snapshot and checks values", () => {
    const ref = React.createRef();
    mockUseState([
      { initialValue: "existing-session-id", setter: vi.fn() },
      { initialValue: [{role: "ai", text: "Hello!"}], setter: vi.fn() },
      { initialValue: true, setter: vi.fn() }
    ]);

    const { container } = render(<ChatBox ref={ref} onClickPresetQuestion={() => {}} />);
    expect(screen.getByTestId("deep-chat")).toBeInTheDocument();
    expect(screen.getByTestId("prewritten-questions")).toBeInTheDocument();

    const historyDiv = screen.getByTestId("history-values");
    expect(historyDiv).toBeInTheDocument();
    expect(historyDiv.textContent).toBe('[{"role":"ai","text":"Hello!"}]');

    const placeholderDiv = screen.getByTestId("placeholder-value");
    expect(placeholderDiv).toBeInTheDocument();
    expect(placeholderDiv.textContent).toBe("chatbot.placeholder - translated");
    expect(container).toMatchSnapshot();
  });

  it("renders SyncLoader when historyLoaded is false", () => {
    mockUseState([
      { initialValue: "existing-session-id", setter: vi.fn() },
      { initialValue: [{role: "ai", text: "Hello!"}], setter: vi.fn() },
      { initialValue: false, setter: vi.fn() }
    ]);
    render(<ChatBox onClickPresetQuestion={() => {}} />);
    const loaderDiv = screen.getByTestId("sync-loader");
    expect(loaderDiv).toBeInTheDocument();
    expect(loaderDiv.parentElement).toHaveStyle({ padding: "20px" });
  });
});

describe("ChatBox - sendPreset imperative handle",  () => {
  let capturedSendPreset;

  beforeEach(() => {
    capturedSendPreset = undefined;
  });

  it("Calls submitUserMessage on refDeepChat when sendPreset is called", () => {
    const ref = React.createRef();
    mockUseState([
      { initialValue: "existing-session-id", setter: vi.fn() },
      { initialValue: [{role: "ai", text: "Hello!"}], setter: vi.fn() },
      { initialValue: true, setter: vi.fn() }
    ]);
    mockedUseImperativeHandle.mockImplementationOnce((ref, callback) => {
      let {sendPreset} = callback();
      capturedSendPreset = sendPreset;
    });

    render(<ChatBox ref={ref} onClickPresetQuestion={() => {}} />);

    capturedSendPreset("test preset");

    expect(mockSubmitUserMessage).toHaveBeenCalledWith({ text: "test preset" });
  });
});

describe("ChatBox - useEffect style injection", () => {
  it("adds a style element to deepChat.shadowRoot via appendChild", () => {
    mockUseState([
      { initialValue: "existing-session-id", setter: vi.fn() },
      { initialValue: [{role: "ai", text: "Hello!"}], setter: vi.fn() },
      { initialValue: true, setter: vi.fn() }
    ]);
    const appendChild = vi.fn();
    const shadowRoot = { appendChild };
    const deepChatEl = { shadowRoot };
    const originalQuerySelector = document.querySelector;
    document.querySelector = vi.fn(() => deepChatEl);

    render(<ChatBox onClickPresetQuestion={() => {}} />);

    expect(appendChild).toHaveBeenCalledTimes(1);

    const styleArg = appendChild.mock.calls[0][0];

    expect(styleArg.tagName).toBe("STYLE");
    expect(styleArg.textContent).toContain("border-radius: 50%");
    expect(styleArg.textContent).toContain("a { color: #00d9a6");
    expect(styleArg.textContent).toContain("a:hover { color: #00ffc3");

    document.querySelector = originalQuerySelector;
  });

  it("Do not add style element if deepChat.shadowRoot is undefined", () => {
    mockUseState([
      { initialValue: "existing-session-id", setter: vi.fn() },
      { initialValue: [{role: "ai", text: "Hello!"}], setter: vi.fn() },
      { initialValue: true, setter: vi.fn() }
    ]);
    const deepChatEl = { shadowRoot: undefined };
    const originalQuerySelector = document.querySelector;
    document.querySelector = vi.fn(() => deepChatEl);

    render(<ChatBox onClickPresetQuestion={() => {}} />);

    expect(document.querySelector).toHaveBeenCalledWith("deep-chat");
    expect(deepChatEl.shadowRoot).toBeUndefined();

    document.querySelector = originalQuerySelector;
  });
});

describe("ChatBox - useState sessionId", () => {
  beforeEach(() => {
    mockedGetChatBotSessionId.mockClear();
    mockedInitNewChatBotSession.mockClear();
  });

  it("calls getChatBotSessionId to initialize sessionId state", () => {
    mockedGetChatBotSessionId.mockReturnValue("existing-session-id");

    mockUseState([
      { initialValue: "existing-session-id", setter: vi.fn() },
      { initialValue: [], setter: vi.fn() },
      { initialValue: true, setter: vi.fn() }
    ]);

    render(<ChatBox onClickPresetQuestion={() => {}} />);

    expect(mockedGetChatBotSessionId).toHaveBeenCalled();
  });

  it("calls initNewChatBotSession and updates sessionId when reset is triggered", () => {
    const setSessionId = vi.fn();
    mockedInitNewChatBotSession.mockReturnValue("new-session-id");

    mockUseState([
      { initialValue: "existing-session-id", setter: setSessionId },
      { initialValue: [], setter: vi.fn() },
      { initialValue: true, setter: vi.fn() }
    ]);

    render(<ChatBox onClickPresetQuestion={() => {}} />);

    const resetButton = screen.getByTestId("fa-rotate-left");
    resetButton.parentElement.click();

    expect(mockedInitNewChatBotSession).toHaveBeenCalled();
    expect(setSessionId).toHaveBeenCalledWith("new-session-id");
  });
});

describe("ChatBox - connect handler (onAudioTranscribed & chatAskQuestion)", () => {
  beforeEach(() => {
    mockCaptureConnect.mockClear();
    mockedChatAskQuestion.mockClear();
    mockedTranscribeAudio.mockClear();
    mockAddMessage.mockClear();
    mockGetMessages.mockClear();
    mockUpdateMessage.mockClear();
    mockGetRecordedAudioBlob.mockClear();
    mockToggleLoading.mockClear();
  });

  it("calls transcribeAudio, onAudioTranscribed and chatAskQuestion with transcribed=true when body is FormData", async () => {
    mockUseState([
      { initialValue: "existing-session-id", setter: vi.fn() },
      { initialValue: [{role: "ai", text: "Hello!"}], setter: vi.fn() },
      { initialValue: true, setter: vi.fn() }
    ]);

    mockGetMessages.mockReturnValue([
      { role: "user", html: "<audio>", files: ["audio.wav"] }
    ]);
    mockedTranscribeAudio.mockResolvedValue("transcribed text");
    mockedChatAskQuestion.mockResolvedValue("AI response");

    render(<ChatBox onClickPresetQuestion={() => {}} />);

    const connectProp = mockCaptureConnect.mock.calls[0][0];
    const mockSignals = { onResponse: vi.fn() };
    const formData = new FormData();
    formData.append("audio", new Blob(["audio-data"]), "audio.wav");

    await connectProp.handler(formData, mockSignals);

    expect(mockGetMessages).toHaveBeenCalled();
    expect(mockUpdateMessage).toHaveBeenCalledWith(
      { html: '', files: [] },
      0
    );
    expect(mockedTranscribeAudio).toHaveBeenCalledWith(formData);
    expect(mockAddMessage).toHaveBeenCalledWith({ role: "user", text: "transcribed text" });
    expect(mockedChatAskQuestion).toHaveBeenCalledWith(
      { messages: [{ role: "user", text: "transcribed text" }] },
      "existing-session-id",
      true
    );
    expect(mockSignals.onResponse).toHaveBeenCalledWith({ text: "AI response" });

    // Verify loading toggle sequence: user → off → ai → off
    expect(mockToggleLoading).toHaveBeenCalledTimes(4);
    expect(mockToggleLoading.mock.calls[0][0]).toEqual({ role: "user" });
    expect(mockToggleLoading.mock.calls[1][0]).toBeUndefined();
    expect(mockToggleLoading.mock.calls[2][0]).toEqual({ role: "ai" });
    expect(mockToggleLoading.mock.calls[3][0]).toBeUndefined();
  });

  it("calls chatAskQuestion with transcribed=false when body is a regular object", async () => {
    mockUseState([
      { initialValue: "existing-session-id", setter: vi.fn() },
      { initialValue: [{role: "ai", text: "Hello!"}], setter: vi.fn() },
      { initialValue: true, setter: vi.fn() }
    ]);

    mockedChatAskQuestion.mockResolvedValue("AI text response");

    render(<ChatBox onClickPresetQuestion={() => {}} />);

    const connectProp = mockCaptureConnect.mock.calls[0][0];
    const mockSignals = { onResponse: vi.fn() };
    const body = { messages: [{ role: "user", text: "Hello" }] };

    await connectProp.handler(body, mockSignals);

    expect(mockedTranscribeAudio).not.toHaveBeenCalled();
    expect(mockAddMessage).not.toHaveBeenCalled();
    expect(mockedChatAskQuestion).toHaveBeenCalledWith(body, "existing-session-id");
    expect(mockSignals.onResponse).toHaveBeenCalledWith({ text: "AI text response" });

    // Verify loading toggle sequence: ai → off
    expect(mockToggleLoading).toHaveBeenCalledTimes(2);
    expect(mockToggleLoading.mock.calls[0][0]).toEqual({ role: "ai" });
    expect(mockToggleLoading.mock.calls[1][0]).toBeUndefined();
  });

  it("waits for recorded audio blob and rebuilds FormData when file is empty (race condition)", async () => {
    mockUseState([
      { initialValue: "existing-session-id", setter: vi.fn() },
      { initialValue: [{role: "ai", text: "Hello!"}], setter: vi.fn() },
      { initialValue: true, setter: vi.fn() }
    ]);

    const realAudioBlob = new Blob(["real-audio-data"], { type: "audio/wav" });
    mockGetRecordedAudioBlob.mockResolvedValue(realAudioBlob);
    mockGetMessages.mockReturnValue([
      { role: "user", html: "<audio>", files: ["audio.wav"] }
    ]);
    mockedTranscribeAudio.mockResolvedValue("transcribed from recovered audio");
    mockedChatAskQuestion.mockResolvedValue("AI response");

    render(<ChatBox onClickPresetQuestion={() => {}} />);

    const connectProp = mockCaptureConnect.mock.calls[0][0];
    const mockSignals = { onResponse: vi.fn() };
    const emptyFormData = new FormData();
    emptyFormData.append("files", new File([], ""));

    await connectProp.handler(emptyFormData, mockSignals);

    expect(mockGetRecordedAudioBlob).toHaveBeenCalled();
    expect(mockedTranscribeAudio).toHaveBeenCalled();
    const sentFormData = mockedTranscribeAudio.mock.calls[0][0];
    const sentFile = sentFormData.get("files");
    expect(sentFile.size).toBeGreaterThan(0);
    expect(mockedChatAskQuestion).toHaveBeenCalledWith(
      { messages: [{ role: "user", text: "transcribed from recovered audio" }] },
      "existing-session-id",
      true
    );
    expect(mockSignals.onResponse).toHaveBeenCalledWith({ text: "AI response" });

    // Verify loading toggle sequence: user → off → ai → off
    expect(mockToggleLoading).toHaveBeenCalledTimes(4);
    expect(mockToggleLoading.mock.calls[0][0]).toEqual({ role: "user" });
    expect(mockToggleLoading.mock.calls[1][0]).toBeUndefined();
    expect(mockToggleLoading.mock.calls[2][0]).toEqual({ role: "ai" });
    expect(mockToggleLoading.mock.calls[3][0]).toBeUndefined();
  });

  it("throws an error when FormData file is empty and no audio blob is recovered", async () => {
    mockUseState([
      { initialValue: "existing-session-id", setter: vi.fn() },
      { initialValue: [{role: "ai", text: "Hello!"}], setter: vi.fn() },
      { initialValue: true, setter: vi.fn() }
    ]);

    mockGetRecordedAudioBlob.mockResolvedValue(null);

    render(<ChatBox onClickPresetQuestion={() => {}} />);

    const connectProp = mockCaptureConnect.mock.calls[0][0];
    const mockSignals = { onResponse: vi.fn() };
    const emptyFormData = new FormData();
    emptyFormData.append("files", new File([], ""));

    await expect(connectProp.handler(emptyFormData, mockSignals))
      .rejects.toThrow("Audio recording failed. Please try again.");

    expect(mockGetRecordedAudioBlob).toHaveBeenCalled();
    expect(mockedTranscribeAudio).not.toHaveBeenCalled();
    expect(mockedChatAskQuestion).not.toHaveBeenCalled();
    expect(mockToggleLoading).not.toHaveBeenCalled();
  });

  it("cleans up user-side loading and responds with error when transcription fails", async () => {
    mockUseState([
      { initialValue: "existing-session-id", setter: vi.fn() },
      { initialValue: [{role: "ai", text: "Hello!"}], setter: vi.fn() },
      { initialValue: true, setter: vi.fn() }
    ]);

    mockGetMessages.mockReturnValue([
      { role: "user", html: "<audio>", files: ["audio.wav"] }
    ]);
    mockedTranscribeAudio.mockRejectedValue(new Error("Transcription failed"));

    render(<ChatBox onClickPresetQuestion={() => {}} />);

    const connectProp = mockCaptureConnect.mock.calls[0][0];
    const mockSignals = { onResponse: vi.fn() };
    const formData = new FormData();
    formData.append("audio", new Blob(["audio-data"]), "audio.wav");

    await connectProp.handler(formData, mockSignals);

    // Verify user loading was toggled on then cleaned up
    expect(mockToggleLoading).toHaveBeenCalledTimes(2);
    expect(mockToggleLoading.mock.calls[0][0]).toEqual({ role: "user" });
    expect(mockToggleLoading.mock.calls[1][0]).toBeUndefined();

    expect(mockedChatAskQuestion).not.toHaveBeenCalled();
    expect(mockSignals.onResponse).toHaveBeenCalledWith({
      text: "errors.chatbot.transcriptionError - translated",
      role: "error"
    });
  });
});
