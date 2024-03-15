"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
// Import necessary modules and types from Jest, fs, and path
const reporters_1 = require("@jest/reporters");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
// Helper function to clean the text, removing special characters
function cleanText(text) {
    return text.replace(/\u001b\[\d+m/g, "");
}
// CustomReporter class extending BaseReporter
class CustomReporter extends reporters_1.BaseReporter {
    constructor(globalConfig, options) {
        super();
        this._globalConfig = globalConfig;
        this._options = options;
    }
    onRunComplete(test, results) {
        const { report, errorsReport } = this._formatResults(results);
        const finalSummary = this._formatFinalSummary(results);
        const outputPath = path_1.default.join(__dirname, "test-report.txt");
        // Write the test results summary to the file
        fs_1.default.writeFile(outputPath, `${finalSummary}\n\n${report}\n\n${errorsReport}\n`, (writeErr) => {
            if (writeErr) {
                console.error("Error writing to file:", writeErr);
            }
            else {
                console.log(`Report written to ${outputPath}`);
            }
        });
    }
    _formatResults(results) {
        let report = "";
        let errorsReport = "";
        results.testResults.forEach((testResult) => {
            // Start by printing the test file path
            report += `${testResult.testFilePath}\n`;
            const suiteResults = testResult.testResults;
            const formatByAncestorTitles = (tests, depth = 0) => {
                const indent = "  ".repeat(depth);
                if (tests.length === 0) {
                    return;
                }
                const groupedByAncestor = tests.reduce((acc, test) => {
                    const ancestorTitle = test.ancestorTitles[depth] || "Other Tests";
                    if (!acc[ancestorTitle]) {
                        acc[ancestorTitle] = [];
                    }
                    acc[ancestorTitle].push(test);
                    return acc;
                }, {});
                Object.entries(groupedByAncestor).forEach(([ancestorTitle, tests]) => {
                    if (ancestorTitle !== "Other Tests" || depth > 0) {
                        report += `${indent}- ${ancestorTitle}\n`;
                    }
                    if (tests[0].ancestorTitles.length > depth + 1) {
                        formatByAncestorTitles(tests, depth + 1);
                    }
                    else {
                        tests.forEach((test) => {
                            const testStatus = test.status.toUpperCase();
                            const testTitle = test.title;
                            const testDuration = `${test.duration}ms`;
                            report += `${indent}  - ${testStatus}, ${testTitle}, ${testDuration}\n`;
                        });
                    }
                });
            };
            formatByAncestorTitles(suiteResults);
            testResult.testResults.forEach((result) => {
                if (result.status === "failed") {
                    errorsReport += `\nFAIL ${testResult.testFilePath}\n`;
                    result.failureMessages.forEach((failureMessage) => {
                        errorsReport += `  ● ${result.ancestorTitles.join(" › ")} › ${result.title}\n\n`;
                        errorsReport += `    ${cleanText(failureMessage)}\n`;
                    });
                }
            });
        });
        return { report: report.trim(), errorsReport: errorsReport.trim() };
    }
    _formatFinalSummary(results) {
        const numTotalTestSuites = results.numTotalTestSuites;
        const numPassedTestSuites = results.numPassedTestSuites;
        const numFailedTestSuites = results.numFailedTestSuites;
        const numTotalTests = results.numTotalTests;
        const numPassedTests = results.numPassedTests;
        const numFailedTests = results.numFailedTests;
        const numTotalSnapshots = results.snapshot.total;
        const time = (results.testResults[0]?.perfStats.end -
            results.testResults[0]?.perfStats.start) /
            1000 || 0;
        const estimatedTime = results.startTime
            ? (Date.now() - results.startTime) / 1000
            : 0;
        return (`Test Suites: ${numFailedTestSuites} failed, ${numPassedTestSuites} passed, ${numTotalTestSuites} total\n` +
            `Tests:       ${numFailedTests} failed, ${numPassedTests} passed, ${numTotalTests} total\n` +
            `Snapshots:   ${numTotalSnapshots} total\n` +
            `Time:        ${time.toFixed(3)}s, estimated ${estimatedTime.toFixed(0)}s\n`);
    }
}
module.exports = CustomReporter;
