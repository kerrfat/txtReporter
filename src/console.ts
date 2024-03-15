import { Reporter, Test, TestResult } from "@jest/reporters";
import * as fs from "fs";

class CustomJestReporter implements Reporter {
  private logs: Map<string, string[]> = new Map();

  onTestStart(test: Test) {
    // Override console.log
    const originalConsoleLog = console.log;
    console.log = (...args) => {
      const message = args.join(" ");
      const logs = this.logs.get(test.name) || [];
      logs.push(message);
      this.logs.set(test.name, logs);

      // Optionally, you can also print the log
      originalConsoleLog.apply(console, args);
    };
  }

  onTestResult(test: Test, testResult: TestResult) {
    // Restore the original console.log
    console.log = this.originalConsoleLog;

    // Here you might want to do something with the captured logs,
    // especially if you need to handle them on a per-test basis.
  }

  onRunComplete() {
    // Save the logs to a file
    let content = "";
    this.logs.forEach((logs, title) => {
      content += `Test: ${title}\n${logs.join("\n")}\n\n`;
    });

    fs.writeFileSync("test-logs.txt", content);
  }
}

module.exports = CustomJestReporter;
