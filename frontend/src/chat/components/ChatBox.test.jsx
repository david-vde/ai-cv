import React, {useImperativeHandle as mockedUseImperativeHandle} from "react";
import {act, render, screen} from "@testing-library/react";
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
  DeepChat: ({ history }) => (
    <div data-testid="deep-chat">
      {history && <span data-testid="history-present">History loaded</span>}
    </div>
  )
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
  it("renders DeepChat with history prop, PreWrittenQuestions, matches snapshot and checks history value", () => {
    const ref = React.createRef();
    const { container } = render(<ChatBox ref={ref} onClickPresetQuestion={() => {}} />);
    expect(screen.getByTestId("deep-chat")).toBeInTheDocument();
    expect(screen.getByTestId("history-present")).toBeInTheDocument();
    expect(screen.getByTestId("prewritten-questions")).toBeInTheDocument();
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
