import React from "react";
import { render } from "@testing-library/react";
import LinksPanel from "./LinksPanel.jsx";
import { useConfig as mockedUseConfig } from "../../configs/context/ConfigContext.jsx";

vi.mock("../../configs/context/ConfigContext.jsx", () => ({
  useConfig: vi.fn()
}));

vi.mock("react-icons/fa", () => ({
  FaGithub: function MockedFaGithub() {
    return <div className="MockedFaGithub">FaGithub</div>;
  },
  FaLinkedin: function MockedFaLinkedin() {
	return <div className="MockedFaLinkedin">FaLinkedin</div>;
  }
}));

function mockUseConfig() {
  mockedUseConfig.mockImplementationOnce(() => ({
    configs: {
      'contact.github': 'https://github.com/johndoe',
      'contact.linkedin': 'https://www.linkedin.com/in/johndoe/',
      'contact.chatbot_github_repository': 'https://github.com/johndoe/chatbot'
    },
    loading: false
  }));
}

describe("LinksPanel - rendering", () => {
  it("renders the three links with FaGithub and FaLinkedin icons", () => {
    mockUseConfig();
    const { container } = render(<LinksPanel />);

    const githubLink = container.querySelector(".link-github");
    const linkedinLink = container.querySelector(".link-linkedin");
    const repoLink = container.querySelector(".link-repo");

    expect(githubLink).toHaveTextContent("GitHub");
    expect(linkedinLink).toHaveTextContent("LinkedIn");
    expect(repoLink).toHaveTextContent("Chatbot repository");

    expect(githubLink).toHaveTextContent("FaGithub");
    expect(linkedinLink).toHaveTextContent("FaLinkedin");
    expect(repoLink).toHaveTextContent("FaGithub");
  });
});
