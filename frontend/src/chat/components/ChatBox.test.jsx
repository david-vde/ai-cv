import React, {useImperativeHandle as mockedUseImperativeHandle} from "react";
import {render, screen} from "@testing-library/react";
import {useConfig as mockedUseConfig} from "../../configs/context/ConfigContext.jsx";
import ChatBox from "./ChatBox.jsx";

const mockSubmitUserMessage = vi.fn();

vi.mock('../../configs/context/ConfigContext', () => ({
    useConfig: vi.fn() }
));

vi.mock("react", async () => {
  const actual = await vi.importActual("react");
  return {
    ...actual,
    forwardRef: vi.fn(Component => Component),
    useEffect: vi.fn((fn) => fn()),
    useImperativeHandle: vi.fn(),
    useMemo: vi.fn((fn) => fn()),
    useRef: vi.fn(() => ({ current: { submitUserMessage: mockSubmitUserMessage } })),
  };
});

vi.mock("../queries/ask-question.jsx", () => ({
  chatAskQuestion: vi.fn()
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
    t: (key) => key + " - translated"
  })
}));

function mockUseConfig() {
  mockedUseConfig.mockImplementationOnce(() => ({
    configs: {
      'contact.firstname': 'John',
      'contact.lastname': 'Doe'
    },
    loading: false
  }));
}

beforeEach(() => {
  mockUseConfig();
});

describe("ChatBox - rendering", () => {
  it("renders DeepChat with history and placeholder props, PreWrittenQuestions, matches snapshot and checks values", () => {
    const ref = React.createRef();
    const { container } = render(<ChatBox ref={ref} onClickPresetQuestion={() => {}} />);
    expect(screen.getByTestId("deep-chat")).toBeInTheDocument();
    expect(screen.getByTestId("prewritten-questions")).toBeInTheDocument();

    const historyDiv = screen.getByTestId("history-values");
    expect(historyDiv).toBeInTheDocument();
    expect(historyDiv.textContent).toBe('[{"role":"ai","text":"chatbot.helloMessage - translated"}]');

    const placeholderDiv = screen.getByTestId("placeholder-value");
    expect(placeholderDiv).toBeInTheDocument();
    expect(placeholderDiv.textContent).toBe("chatbot.placeholder - translated");
    expect(container).toMatchSnapshot();
  });
});

describe("ChatBox - sendPreset imperative handle",  () => {
  let capturedSendPreset;

  beforeEach(() => {
    capturedSendPreset = undefined;
  });

  it("Calls submitUserMessage on refDeepChat when sendPreset is called", () => {
    const ref = React.createRef();

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
  it("ajoute un élément style dans deepChat.shadowRoot via appendChild", () => {
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
    const deepChatEl = {};
    const originalQuerySelector = document.querySelector;
    document.querySelector = vi.fn(() => deepChatEl);

    const createElementSpy = vi.spyOn(document, "createElement");

    expect(() => {
      render(<ChatBox onClickPresetQuestion={() => {}} />);
    });

    expect(createElementSpy).not.toHaveBeenCalledWith("style");

    document.querySelector = originalQuerySelector;
    createElementSpy.mockRestore();
  });
});
