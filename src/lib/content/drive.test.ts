import { describe, expect, it } from "vitest";

import { extractDriveFileId, isDriveDirectImageUrl, toDriveDirectImageUrl } from "./drive";

describe("extractDriveFileId", () => {
  it("pulls the id from a standard /file/d/ID/view share link", () => {
    expect(
      extractDriveFileId("https://drive.google.com/file/d/1aB2cD3eF_g-H_IJ/view?usp=sharing"),
    ).toBe("1aB2cD3eF_g-H_IJ");
  });

  it("pulls the id from an /open?id=ID link", () => {
    expect(extractDriveFileId("https://drive.google.com/open?id=xyz_123-ABC")).toBe("xyz_123-ABC");
  });

  it("pulls the id from an already-direct uc?id= link", () => {
    expect(extractDriveFileId("https://drive.google.com/uc?export=view&id=file-id-here")).toBe(
      "file-id-here",
    );
  });

  it("handles Docs/Slides/Sheets URLs too", () => {
    expect(extractDriveFileId("https://docs.google.com/document/d/abc-DEF_123/edit")).toBe(
      "abc-DEF_123",
    );
  });

  it("returns null for non-Drive URLs", () => {
    expect(extractDriveFileId("https://example.com/image.png")).toBeNull();
    expect(extractDriveFileId("not-a-url")).toBeNull();
    expect(extractDriveFileId("")).toBeNull();
  });

  it("trims whitespace before matching", () => {
    expect(extractDriveFileId("  https://drive.google.com/file/d/id-with-spaces/view  ")).toBe(
      "id-with-spaces",
    );
  });
});

describe("toDriveDirectImageUrl", () => {
  it("produces the canonical direct-view URL from a share link", () => {
    expect(
      toDriveDirectImageUrl("https://drive.google.com/file/d/1aB2cD3eF/view?usp=sharing"),
    ).toBe("https://drive.google.com/uc?export=view&id=1aB2cD3eF");
  });

  it("returns null for non-Drive URLs", () => {
    expect(toDriveDirectImageUrl("https://example.com/image.png")).toBeNull();
  });
});

describe("isDriveDirectImageUrl", () => {
  it("returns true for converted URLs", () => {
    expect(isDriveDirectImageUrl("https://drive.google.com/uc?export=view&id=abc")).toBe(true);
  });

  it("returns false for share-format URLs", () => {
    expect(isDriveDirectImageUrl("https://drive.google.com/file/d/abc/view")).toBe(false);
  });

  it("returns false for non-Drive URLs", () => {
    expect(isDriveDirectImageUrl("https://example.com/image.png")).toBe(false);
  });
});
