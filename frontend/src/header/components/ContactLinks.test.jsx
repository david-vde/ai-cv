import React from "react";
import { render, screen } from "@testing-library/react";
import ContactLinks from "./ContactLinks";
import {useConfig as mockedUseConfig} from "../../configs/context/ConfigContext.jsx";

vi.mock('../../configs/context/ConfigContext', () => ({
  useConfig: vi.fn() }
));

function mockUseConfig(configs, loading = false) {
  mockedUseConfig.mockImplementationOnce(() => ({
    configs, loading
  }));
}

describe("ContactLinks - rendering", () => {
  test("renders the phone/email link with the correct value", () => {
    mockUseConfig({
      'contact.phone': '+32000000000',
      'contact.email': 'some@email.com'
    });

    const {container} = render(<ContactLinks />);

    const phoneLink = container.querySelector(".contact-item.phone");
    const emailLink = container.querySelector(".contact-item.email");
    expect(phoneLink).toHaveTextContent("+32000000000");
    expect(emailLink).toHaveTextContent("some@email.com");
    expect(phoneLink.getAttribute("href")).toBe("tel:+32000000000");
    expect(emailLink.getAttribute("href")).toBe("mailto:some@email.com");

    expect(container).toMatchSnapshot();
  });
});
