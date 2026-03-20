import React, {useRef as mockedUseRef} from "react";
import { render } from "@testing-library/react";
import {useConfig as mockedUseConfig} from "./configs/context/ConfigContext.jsx";
import App from "./App.jsx";

let capturedOnClickPresetQuestion;

beforeEach(() => {
  capturedOnClickPresetQuestion = undefined;
})

vi.mock("react", async () => {
  const React = await import("react");
  return {
    ...React,
    useRef: vi.fn()
  };
});

vi.mock("./chat/components/ChatBox.jsx", () => ({
  default: React.forwardRef(function MockedChatBox(props, ref) {
    if (typeof props.onClickPresetQuestion === 'function') {
      capturedOnClickPresetQuestion = props.onClickPresetQuestion;
    }

    return (
      <div className="MockedChatBox">
        <div className="onClickPresetQuestion">{props.onClickPresetQuestion && 'onClickPresetQuestion'}</div>
        <div className="children">{props.children}</div>
      </div>
    );
  })
}));

vi.mock("./header/components/Header.jsx", () => ({
  default: function MockedHeader() {
    return <div className="MockedHeader">MockedHeader</div>;
  }
}));

vi.mock("react-spinners", () => ({
  PacmanLoader: () => <div className="MockedPacmanLoader" />
}));

vi.mock("./configs/context/ConfigContext.jsx", () => {
  return {
	useConfig: vi.fn()
  };
});


vi.mock("react-router", () => ({
  Route: (props) => (
    <div className="MockedRoute">
      <div className="path">{props.path}</div>
      <div className="element">{props.element}</div>
    </div>
  ),
  Routes: (props) => <div className="MockedRoutes">{props.children}</div>
}));

function mockUseConfig(loading) {
  mockedUseConfig.mockImplementationOnce(() => ({
    configs: {},
    loading: loading
  }));
}

describe("App - onClickPresetQuestion", () => {
  it("onClickPresetQuestion calls refChatBox.current.sendPreset", () => {
    const sendPresetMock = vi.fn();
    const refMock = { current: { sendPreset: sendPresetMock } };
    mockedUseRef.mockReturnValue(refMock);
    mockUseConfig(false);

    render(<App />);

    expect(typeof capturedOnClickPresetQuestion).toBe("function");

    capturedOnClickPresetQuestion("test-question");

    expect(sendPresetMock).toHaveBeenCalledTimes(1);
    expect(sendPresetMock).toHaveBeenNthCalledWith(1, "test-question");
  });
});

describe("App - rendering", () => {
  it("Display PacmanLoader when loadingConfig is true", () => {
    mockUseConfig(true);
    const { container } = render(<App />);
    const loader = container.querySelector('.MockedPacmanLoader');
    expect(loader).not.toBeNull();
  });
  it("displays Header and 4 Route with correct paths when loadingConfig is false", () => {
    mockUseConfig(false);
    const { container } = render(<App />);
    const header = container.querySelector('.MockedHeader');
    expect(header).not.toBeNull();
    const routes = Array.from(container.querySelectorAll('.MockedRoute'));
    expect(routes.length).toBe(4);
    const paths = routes.map(route => route.querySelector('.path')?.textContent);
    expect(paths).toContain("/");
    expect(paths).toContain("/cv");
    expect(paths).toContain("/career");
    expect(paths).toContain("*");
  });
});
