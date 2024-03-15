import fs from "fs";
import path from "path";

class CustomReporter {
  private _globalConfig: any;
  private _options: any;

  constructor(globalConfig: any, options: any) {
    this._globalConfig = globalConfig;
    this._options = options;
  }

  onRunComplete(_context: any, results: any) {
    const { report, errorsReport } = this._formatResults(results);
    const finalSummary = this._formatFinalSummary(results);
    const outputPath = path.join(__dirname, "test-report.txt");

    // Write the test results summary to the file
    fs.writeFile(
      outputPath,
      finalSummary + "\n\n" + report + "\n\n" + errorsReport + "\n",
      (writeErr) => {
        if (writeErr) {
          console.error("Error writing to file:", writeErr);
        } else {
          console.log(`Report written to ${outputPath}`);
        }
      }
    );
  }

  private _formatResults(results: any) {
    let report = "";
    let errorsReport = "";
    results.testResults.forEach((testResult: any) => {
      // Start by printing the test file path
      report += `${testResult.testFilePath}\n`;
      const suiteResults = testResult.testResults;

      // A function to recursively format results by their ancestorTitles
      const formatByAncestorTitles = (tests: any, depth = 0) => {
        const indent = "  ".repeat(depth);
        if (tests.length === 0) {
          return;
        }

        // Group tests by their immediate ancestorTitle at the current depth
        const groupedByAncestor = tests.reduce((acc: any, test: any) => {
          const ancestorTitle: any =
            test.ancestorTitles[depth] || "Other Tests";
          if (!acc[ancestorTitle]) {
            acc[ancestorTitle] = [];
          }
          acc[ancestorTitle].push(test);
          return acc;
        }, {});

        Object.entries(groupedByAncestor).forEach(([ancestorTitle, tests]) => {
          // Skip printing the suite title for the top-level 'Other Tests'
          if ((tests as any)[0].ancestorTitles.length > depth + 1) {
            formatByAncestorTitles(tests as any, depth + 1);
          } else {
            (tests as any[]).forEach((test: any) => {
              // Add type assertion
              const testStatus = test.status.toUpperCase();
              const testTitle = test.title;
              const testDuration = `${test.duration}ms`;
              report += `${indent}  - ${testStatus}, ${testTitle}, ${testDuration}\n`;
            });
          }
        });
      };

      // Start the recursive formatting with the test results and an initial depth of 0
      formatByAncestorTitles(suiteResults);
      // Now handle errors
      testResult.testResults.forEach((result: any) => {
        if (result.status === "failed") {
          errorsReport += `\nFAIL ${testResult.testFilePath}\n`;
          result.failureMessages.forEach((failureMessage: string) => {
            errorsReport += `  ● ${result.ancestorTitles.join(" › ")} › ${
              result.title
            }\n\n`;
            errorsReport += `    ${this.cleanText(failureMessage)}\n`;
          });
        }
      });
    });
    return { report: report.trim(), errorsReport: errorsReport.trim() };
  }

  private _formatFinalSummary(results: any) {
    const numTotalTestSuites = results.numTotalTestSuites;
    const numPassedTestSuites = results.numPassedTestSuites;
    const numFailedTestSuites = results.numFailedTestSuites;
    const numTotalTests = results.numTotalTests;
    const numPassedTests = results.numPassedTests;
    const numFailedTests = results.numFailedTests;
    const numTotalSnapshots = results.snapshot.total;
    const time =
      (results.testResults[0]?.perfStats?.end -
        results.testResults[0]?.perfStats?.start) /
        1000 || 0;
    const estimatedTime = results.startTime
      ? (Date.now() - results.startTime) / 1000
      : 0;

    return (
      `Test Suites: ${numFailedTestSuites} failed, ${numPassedTestSuites} passed, ${numTotalTestSuites} total\n` +
      `Tests:       ${numFailedTests} failed, ${numPassedTests} passed, ${numTotalTests} total\n` +
      `Snapshots:   ${numTotalSnapshots} total\n` +
      `Time:        ${time.toFixed(3)}s, estimated ${estimatedTime.toFixed(
        0
      )}s\n`
    );
  }

  private cleanText(text: string) {
    return text.replace(/\u001b\[\d+m/g, "");
  }
}

export = CustomReporter;
