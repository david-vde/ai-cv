import React from "react";
import { retrieveConfig } from "./retrieve-configs";

// Mock global fetch
global.fetch = vi.fn();

describe("retrieveConfig", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("should return configs when response.ok is true", async () => {
    const mockJson = [
      { name: "config1", data: { a: 1 } },
      { name: "config2", data: { b: 2 } }
    ];
    const mockResponse = {
      ok: true,
      json: vi.fn().mockResolvedValue(mockJson)
    };
    fetch.mockResolvedValueOnce(mockResponse);

    const result = await retrieveConfig("http://localhost");
    expect(result).toEqual({ config1: { a: 1 }, config2: { b: 2 } });
    expect(fetch).toHaveBeenCalledWith(
      "http://localhost/config",
      expect.objectContaining({ method: "GET" })
    );
  });

  it("should throw an error when response.ok is false", async () => {
    const mockJson = { error: "Erreur serveur" };
    const mockResponse = {
      ok: false,
      json: vi.fn().mockResolvedValue(mockJson)
    };
    fetch.mockResolvedValueOnce(mockResponse);

    await expect(retrieveConfig("http://localhost")).rejects.toThrow("Erreur serveur");
    expect(fetch).toHaveBeenCalledWith(
      "http://localhost/config",
      expect.objectContaining({ method: "GET" })
    );
  });
});
