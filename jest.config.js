module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  testMatch: ["**/*.spec.ts"],
  reporters: [
    "default","./src/index.js",    
  ],
};
