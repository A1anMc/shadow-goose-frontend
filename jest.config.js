module.exports = {
  testEnvironment: "jsdom",
  testMatch: ["**/__tests__/**/*.test.{js,ts,tsx}", "**/?(*.)+(spec|test).{js,ts,tsx}"],
  transform: {
    "^.+\\.(ts|tsx|js)$": [
      "babel-jest",
      { presets: ["@babel/preset-env", "@babel/preset-react", "@babel/preset-typescript"] }
    ]
  },
  moduleFileExtensions: ["ts", "tsx", "js", "jsx"],
  collectCoverageFrom: [
    "src/**/*.{js,jsx,ts,tsx}",
    "!**/*.d.ts",
    "!**/node_modules/**",
  ],
  coverageThreshold: {
    global: { branches: 5, functions: 5, lines: 5, statements: 5 }
  },
  setupFilesAfterEnv: ["<rootDir>/jest.setup.js"],
};
