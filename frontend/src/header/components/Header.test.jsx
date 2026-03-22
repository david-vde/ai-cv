import React from "react";
import { useConfig as mockedUseConfig } from "../../configs/context/ConfigContext.jsx";
import { render } from "@testing-library/react";
import Header from "./Header.jsx";

vi.mock("./SkillTags.jsx", () => ({
  default: () => <div className="MockedSkillTags">SkillTags</div>
}));

vi.mock("./ContactLinks.jsx", () => ({
  default: () => <div className="MockedContactLinks">ContactLinks</div>
}));

vi.mock("./LinksPanel.jsx", () =>  ({
  default: () => <div className="MockedLinksPanel">LinksPanel</div>
}));

vi.mock("./HeaderTabs.jsx", () => ({
  default: () => <div className="MockedHeaderTabs">HeaderTabs</div>
}));

vi.mock('../../configs/context/ConfigContext', () => ({
    useConfig: vi.fn() }
));

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key, params) => key + " - translated - " + (params ? JSON.stringify(params) : "")
  })
}));

function mockUseConfig(configs, loading = false) {
  mockedUseConfig.mockImplementationOnce(() => ({
    configs, loading
  }));
}

describe("Header - rendering", () => {
  it("displays config data", () => {
    const configs = {
      'contact.firstname': 'John',
      'contact.lastname': 'Doe',
      'contact.profession': 'Ingenier',
      'contact.experience_years': 5
    };
    mockUseConfig(configs);
    const {container, getByText} = render(<Header />);
    expect(container.querySelector(".bio-name")).toHaveTextContent("John Doe");
    expect(container.querySelector(".bio-title")).toHaveTextContent("Ingenier");
    expect(container.querySelector(".bio-title span")).toHaveTextContent('profile.yearsOfExperience - translated - {"years":5}');
    expect(container.querySelector(".MockedSkillTags").textContent).toBe("SkillTags");
    expect(container.querySelector(".MockedContactLinks").textContent).toBe("ContactLinks");
    expect(container.querySelector(".MockedLinksPanel").textContent).toBe("LinksPanel");
    expect(container.querySelector(".MockedHeaderTabs").textContent).toBe("HeaderTabs");
  });
});
