import React from "react";
import { render } from "@testing-library/react";
import HeaderTabs from "./HeaderTabs.jsx";

vi.mock("react-router", () => ({
  useLocation: () => ({ pathname: "/cv" }),
  Link: (props) => {
    return (
      <div className={"MockedLink"}>
        <div className={"children"}>{props.children}</div>
        <div className={"to"}>{props.to}</div>
      </div>
    )
  }
}));

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key) => key + " - translated"
  })
}));

vi.mock("./LanguageSelector.jsx", () => {
  return {
    default: () => <div className="MockedLanguageSelector">LanguageSelector</div>
  };
});

describe("HeaderTabs - rendering", () => {
  it("renders links with the correct 'to' prop and children content", () => {
    const { container } = render(<HeaderTabs />);
    const links = container.querySelectorAll(".MockedLink");
    expect(links.length).toBe(2);
    expect(container.querySelector(".nav-tab.active")).toHaveTextContent("tabs.cv.label - translated");
    expect(links[0].querySelector(".to").textContent).toBe("/");
    expect(links[0].querySelector(".children").textContent).toBe("tabs.chatbot.label - translated");
    expect(links[1].querySelector(".to").textContent).toBe("/cv");
    expect(links[1].querySelector(".children").textContent).toBe("tabs.cv.label - translated");
  });
});
