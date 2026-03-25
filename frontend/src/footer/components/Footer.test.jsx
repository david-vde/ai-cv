import React from "react";
import { render } from "@testing-library/react";
import Footer from "./Footer.jsx";

vi.mock("react-i18next", () => ({
  Trans: ({ i18nKey, components }) => (
    <span data-testid={`trans-${i18nKey}`}>
      {i18nKey} - translated with components
    </span>
  ),
  useTranslation: () => ({
    t: (key) => key + " - translated"
  })
}));

describe("Footer - rendering", () => {
  it("renders the footer element", () => {
    const { container } = render(<Footer />);
    const footer = container.querySelector("footer.footer");
    expect(footer).toBeInTheDocument();
  });

  it("renders the inner wrapper", () => {
    const { container } = render(<Footer />);
    const inner = container.querySelector(".footer-inner");
    expect(inner).toBeInTheDocument();
  });

  it("renders the hosting span with Trans component", () => {
    const { container, getByTestId } = render(<Footer />);
    const hostingSpan = container.querySelector(".footer-hosting");
    expect(hostingSpan).toBeInTheDocument();
    const trans = getByTestId("trans-footer.hosting");
    expect(trans).toBeInTheDocument();
    expect(trans).toHaveTextContent("footer.hosting - translated with components");
  });

  it("renders the credits span with translated text", () => {
    const { container } = render(<Footer />);
    const creditsSpan = container.querySelector(".footer-credits");
    expect(creditsSpan).toBeInTheDocument();
    expect(creditsSpan).toHaveTextContent("footer.credits - translated");
  });
});

