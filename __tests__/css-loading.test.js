const fs = require("fs");
const path = require("path");

describe("CSS Loading Tests", () => {
  test("CSS file exists in build output", () => {
    const cssDir = path.join(__dirname, "../.next/static/css");
    const cssFiles = fs
      .readdirSync(cssDir)
      .filter((file) => file.endsWith(".css"));
    expect(cssFiles.length).toBeGreaterThan(0);
  });

  test("CSS contains SGE custom classes", () => {
    const cssDir = path.join(__dirname, "../.next/static/css");
    const cssFiles = fs
      .readdirSync(cssDir)
      .filter((file) => file.endsWith(".css"));
    const cssContent = fs.readFileSync(path.join(cssDir, cssFiles[0]), "utf8");

    expect(cssContent).toContain(".bg-sg-background");
    expect(cssContent).toContain(".text-sg-primary");
    expect(cssContent).toContain(".bg-sg-primary");
    expect(cssContent).toContain(".bg-sg-accent");
  });

  test("CSS variables are defined", () => {
    const cssDir = path.join(__dirname, "../.next/static/css");
    const cssFiles = fs
      .readdirSync(cssDir)
      .filter((file) => file.endsWith(".css"));
    const cssContent = fs.readFileSync(path.join(cssDir, cssFiles[0]), "utf8");

    // Check for the actual CSS classes that use SGE variables
    expect(cssContent).toContain(".bg-sg-background");
    expect(cssContent).toContain(".text-sg-primary");
    expect(cssContent).toContain(".bg-sg-primary");
    expect(cssContent).toContain(".bg-sg-accent");
    
    // Check for Tailwind CSS variables that are actually present
    expect(cssContent).toContain(":root");
    expect(cssContent).toContain("--primary-");
    expect(cssContent).toContain("--gray-");
  });
});
