import React from "react";
import { render } from "@testing-library/react";
import {useConfig as mockedUseConfig} from "../../configs/context/ConfigContext.jsx";
import SkillTags from "./SkillTags.jsx";

vi.mock("../../configs/context/ConfigContext.jsx", () => ({
  useConfig: vi.fn()
}));

function mockUseConfig(skillTags) {
  skillTags = JSON.stringify(skillTags);

  mockedUseConfig.mockImplementation(() => ({
    configs: {
      'contact.skill_tags': skillTags
    },
    loading: false
  }));
}

describe("SkillTags - rendering", () => {
  it("should render skill tags correctly", () => {
    mockUseConfig([
      ["PHP", "1c2e4a", "79c0ff", "1f6feb"],
      ["Symfony", "1c2e1c", "7ee787", "238636"],
      ["MySQL", "2a1f1a", "ffa657", "bd5b10"]
    ]);
    const { container } = render(<SkillTags />);

    expect(container.querySelector(".tags")).toHaveTextContent("PHP");
    expect(container.querySelector(".tags")).toHaveTextContent("MySQL");
    expect(container.querySelector(".tags")).toHaveTextContent("Symfony");

    const spans = container.querySelectorAll(".tag");
    expect(spans).toHaveLength(3);

    expect(spans[0].style.backgroundColor).toBe("rgb(28, 46, 74)");
    expect(spans[0].style.color).toBe("rgb(121, 192, 255)");
    expect(spans[0].style.borderColor).toBe("rgb(31, 111, 235)");

    expect(spans[1].style.backgroundColor).toBe("rgb(28, 46, 28)");
    expect(spans[1].style.color).toBe("rgb(126, 231, 135)");
    expect(spans[1].style.borderColor).toBe("rgb(35, 134, 54)");

    expect(spans[2].style.backgroundColor).toBe("rgb(42, 31, 26)");
    expect(spans[2].style.color).toBe("rgb(255, 166, 87)");
    expect(spans[2].style.borderColor).toBe("rgb(189, 91, 16)");
  });

  it("should render nothing when contact.skill_tags is undefined", () => {
    mockUseConfig(undefined);
    const { container } = render(<SkillTags />);
    expect(container.querySelector(".tags")).toBeNull();

  });
})