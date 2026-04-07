import React from "react";
import { render } from "@testing-library/react";
import Cv from "./Cv";
import {useConfig as mockedUseConfig} from "../../configs/context/ConfigContext.tsx";

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key) => key + " - translated"
  })
}));

vi.mock('../../configs/context/ConfigContext', () => ({
    useConfig: vi.fn() }
));

function mockUseConfig(configs, loading = false) {
  mockedUseConfig.mockImplementationOnce(() => ({
    configs, loading
  }));
}

describe("Cv - rendering", () => {
  it("should render the download link with the translated cv.downloadMyPdfCV key", () => {
    mockUseConfig({ "contact.cv_url": "/CV-DAVID.pdf" });

    const { container } = render(<Cv />);

    const link = container.querySelector("a.link");
    expect(link).toBeInTheDocument();
    expect(link.textContent).toContain("cv.downloadMyPdfCV - translated");
    expect(container).toMatchSnapshot();
  });

  it("should render an embed tag with the correct src from contact.cv_url config", () => {
    mockUseConfig({ "contact.cv_url": "/CV-DAVID.pdf" });

    const { container } = render(<Cv />);

    const embed = container.querySelector("embed");
    expect(embed).toBeInTheDocument();
    expect(embed.getAttribute("src")).toBe("/CV-DAVID.pdf#toolbar=0&navpanes=0");
    expect(embed.getAttribute("type")).toBe("application/pdf");
    expect(container).toMatchSnapshot();
  });
});

