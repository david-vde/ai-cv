import React from "react";
import {act, render, screen} from "@testing-library/react";
import ChatBox from "./ChatBox.jsx";

const mockSubmitUserMessage = vi.fn();

vi.mock("react", async () => {
  const actual = await vi.importActual("react");
  return {
    ...actual,
    forwardRef: (renderFn) => {
      return (props) => {
        const ref = props.ref;
        if (ref && typeof ref === "object" && ref.current === null) {
          ref.current = {};
        }
        return renderFn(props, ref);
      };
    },
    useEffect: vi.fn((fn) => fn()),
    useImperativeHandle: (ref, create, deps) => {
      if (typeof ref === "object" && ref !== null) {
        const value = create();
        if (ref.current !== undefined) {
          if (ref.current === null) ref.current = {};
          Object.assign(ref.current, value);
        } else {
          Object.assign(ref, value);
        }
      }
    },
    useMemo: vi.fn((fn) => fn()),
    useRef: vi.fn(() => ({ current: { submitUserMessage: mockSubmitUserMessage } })),
  };
});

vi.mock("../queries/ask-question.jsx", () => ({
  chatAskQuestion: vi.fn()
}));

vi.mock("./PreWrittenQuestions.jsx", () => ({
  __esModule: true,
  default: () => <div data-testid="prewritten-questions">PreWrittenQuestions</div>
}));

vi.mock("deep-chat-react", () => ({
  DeepChat: ({ history }) => (
    <div data-testid="deep-chat">
      {history && <span data-testid="history-present">History loaded</span>}
    </div>
  )
}));

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
  it("Calls submitUserMessage on refDeepChat when sendPreset is called", () => {
    const ref = { current: {} };

    render(<ChatBox ref={ref} onClickPresetQuestion={() => {}} />);

    expect(ref.current.sendPreset).toBeDefined();
    expect(typeof ref.current.sendPreset).toBe("function");

    ref.current.sendPreset("test preset");

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
