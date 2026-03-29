import React, {
  useImperativeHandle as mockedUseImperativeHandle,
  useState as mockedUseState
} from "react";
import {render, screen} from "@testing-library/react";
import {useConfig as mockedUseConfig} from "../../configs/context/ConfigContext.jsx";
import {getChatBotSessionId as mockedGetChatBotSessionId, initNewChatBotSession as mockedInitNewChatBotSession} from "../services/chatBotSession.js";
import _ from "lodash";
import ChatBox from "./ChatBox.jsx";

const mockSubmitUserMessage = vi.fn();

vi.mock('../../configs/context/ConfigContext', () => ({
    useConfig: vi.fn() }
));

vi.mock("../services/chatBotSession.js", () => ({
  getChatBotSessionId: vi.fn(),
  initNewChatBotSession: vi.fn()
}));

vi.mock("react", async () => {
  const actual = await vi.importActual("react");
  return {
    ...actual,
    forwardRef: vi.fn(Component => Component),
    useEffect: vi.fn((fn) => fn()),
    useImperativeHandle: vi.fn(),
    useRef: vi.fn(() => ({ current: { submitUserMessage: mockSubmitUserMessage } })),
    useState: vi.fn()
  };
});

vi.mock("../queries/ask-question.jsx", () => ({
  chatAskQuestion: vi.fn()
}));

vi.mock("../queries/get-history.jsx", () => ({
  getChatHistory: vi.fn()
}));

vi.mock("./PreWrittenQuestions.jsx", () => ({
  default: () => <div data-testid="prewritten-questions">PreWrittenQuestions</div>
}));

vi.mock("deep-chat-react", () => ({
  DeepChat: ({ history, textInput }) => (
    <div data-testid="deep-chat">
      <div data-testid="history-values">{JSON.stringify(history)}</div>
      <div data-testid="placeholder-value">{textInput?.placeholder?.text}</div>
    </div>
  )
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

