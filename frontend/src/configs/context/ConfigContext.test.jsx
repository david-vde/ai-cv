import React, {
  useState as mockedUseState,
  useContext as mockedUseContext
} from "react";
import {render} from "@testing-library/react";
import {retrieveConfig as mockedRetrieveConfig} from "../queries/retrieve-configs.jsx";
import { ConfigProvider, useConfig } from "./ConfigContext.jsx";

vi.mock("../queries/retrieve-configs.jsx", () => ({
  retrieveConfig: vi.fn()
}));

let capturedValue;

vi.mock("react", async () => {
  const React = await import("react");
  return {
    ...React,
    useEffect: (fn) => fn(),
    useState: vi.fn(),
    useContext: vi.fn(),
    createContext: () => ({
      Provider: ({ value, children }) => {
        capturedValue = value;
        return children;
      },
      Consumer: vi.fn(),
    })
  };
});

const mockUseState = (...states) => {
  states.forEach(([value, setter]) => {
    mockedUseState.mockImplementationOnce(() => [value, setter]);
  });
};

describe("ConfigProvider - useEffect succeeds", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });
  it("should call retrieveConfig, setConfigs with the correct value and setLoading to false", async () => {
    const configsMock = [{name: "test", data: "Some data" }];
    mockedRetrieveConfig.mockResolvedValueOnce(configsMock);
    const setConfigs = vi.fn();
    const setLoading = vi.fn();
    const setIsError = vi.fn();

    mockUseState(
      [[], setConfigs],
      [true, setLoading],
      [false, setIsError]);

    await render(
      <ConfigProvider>
        <div>Test</div>
      </ConfigProvider>
    );

    expect(mockedRetrieveConfig).toHaveBeenCalledTimes(1);
    expect(setConfigs).toHaveBeenNthCalledWith(1, configsMock);
    expect(setLoading).toHaveBeenCalledWith(false);
  });

  it("ConfigProvider - useEffect with catched error", async () => {
    mockedRetrieveConfig.mockRejectedValueOnce(new Error("fetch error"));
    const setConfigs = vi.fn();
    const setLoading = vi.fn();
    const setIsError = vi.fn();

    mockUseState(
      [[], setConfigs],
      [true, setLoading],
      [false, setIsError]
    );

    await render(
      <ConfigProvider>
        <div>Test</div>
      </ConfigProvider>
    );

    expect(mockedRetrieveConfig).toHaveBeenCalledTimes(1);
    expect(setIsError).toHaveBeenCalledWith(true);
    expect(setLoading).toHaveBeenCalledWith(false);
    expect(setConfigs).not.toHaveBeenCalled();
  });
});

describe("ConfigProvider - rendering", () => {
  it("should render error fallback when isError is true", async () => {
    const setConfigs = vi.fn();
    const setLoading = vi.fn();
    const setIsError = vi.fn();

    mockUseState(
      [{}, setConfigs],
      [true, setLoading],
      [true, setIsError]
    );

    const { getByText } = render(
      <ConfigProvider>
        <div>Should not render</div>
      </ConfigProvider>
    );

    expect(getByText("Erreur lors du chargement des configurations.")).toBeInTheDocument();
  });

  it("should render children and pass correct props to Provider", async () => {
    const configsMock = [{ id: 1, name: "test", data: "Some data" }];
    mockedRetrieveConfig.mockResolvedValueOnce(configsMock);

    mockUseState(
      [{ test: "Some data" }, vi.fn()],
      [true, vi.fn()],
      [false, vi.fn()]
    );

    const {container} = await render(
      <ConfigProvider>
        <div>Test children</div>
      </ConfigProvider>
    );

    expect(container).toHaveTextContent("Test children");
    expect(capturedValue).toEqual({ configs: { test: "Some data" }, loading: true });
  });
});

describe("useConfig", () => {
  it("Must returns useContext value", () => {
    const mockValue = { foo: "bar" };
    mockedUseContext.mockReturnValueOnce(mockValue);
    expect(useConfig()).toBe(mockValue);
  });
});