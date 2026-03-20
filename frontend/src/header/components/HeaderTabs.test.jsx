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

describe("HeaderTabs - rendering", () => {
  it("renders links with the correct 'to' prop and children content", () => {
    const { container } = render(<HeaderTabs />);
    const links = container.querySelectorAll(".MockedLink");
    expect(links.length).toBe(3);
    expect(container.querySelector(".nav-tab.active")).toHaveTextContent("C.V.");
    expect(links[0].querySelector(".to").textContent).toBe("/");
    expect(links[0].querySelector(".children").textContent).toBe("Chatbot");
    expect(links[1].querySelector(".to").textContent).toBe("/cv");
    expect(links[1].querySelector(".children").textContent).toBe("C.V.");
    expect(links[2].querySelector(".to").textContent).toBe("/career");
    expect(links[2].querySelector(".children").textContent).toBe("Carrière");
  });
});

