"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var fs_1 = __importDefault(require("fs"));
var path_1 = __importDefault(require("path"));
var CustomReporter = /** @class */ (function () {
    function CustomReporter(globalConfig, options) {
        this._globalConfig = globalConfig;
        this._options = options;
    }
    CustomReporter.prototype.onRunComplete = function (_context, results) {
        var _a = this._formatResults(results), report = _a.report, errorsReport = _a.errorsReport;
        var finalSummary = this._formatFinalSummary(results);
        var outputPath = path_1.default.join(__dirname, "test-report.txt");
        // Write the test results summary to the file
        fs_1.default.writeFile(outputPath, finalSummary + "\n\n" + report + "\n\n" + errorsReport + "\n", function (writeErr) {
            if (writeErr) {
                console.error("Error writing to file:", writeErr);
            }
            else {
                console.log("Report written to ".concat(outputPath));
            }
        });
    };
    CustomReporter.prototype._formatResults = function (results) {
        var _this = this;
        var report = "";
        var errorsReport = "";
        results.testResults.forEach(function (testResult) {
            // Start by printing the test file path
            report += "".concat(testResult.testFilePath, "\n");
            var suiteResults = testResult.testResults;
            // A function to recursively format results by their ancestorTitles
            var formatByAncestorTitles = function (tests, depth) {
                if (depth === void 0) { depth = 0; }
                var indent = "  ".repeat(depth);
                if (tests.length === 0) {
                    return;
                }
                // Group tests by their immediate ancestorTitle at the current depth
                var groupedByAncestor = tests.reduce(function (acc, test) {
                    var ancestorTitle = test.ancestorTitles[depth] || "Other Tests";
                    if (!acc[ancestorTitle]) {
                        acc[ancestorTitle] = [];
                    }
                    acc[ancestorTitle].push(test);
                    return acc;
                }, {});
                Object.entries(groupedByAncestor).forEach(function (_a) {
                    var ancestorTitle = _a[0], tests = _a[1];
                    // Skip printing the suite title for the top-level 'Other Tests'
                    if (tests[0].ancestorTitles.length > depth + 1) {
                        formatByAncestorTitles(tests, depth + 1);
                    }
                    else {
                        tests.forEach(function (test) {
                            // Add type assertion
                            var testStatus = test.status.toUpperCase();
                            var testTitle = test.title;
                            var testDuration = "".concat(test.duration, "ms");
                            report += "".concat(indent, "  - ").concat(testStatus, ", ").concat(testTitle, ", ").concat(testDuration, "\n");
                        });
                    }
                });
            };
            // Start the recursive formatting with the test results and an initial depth of 0
            formatByAncestorTitles(suiteResults);
            // Now handle errors
            testResult.testResults.forEach(function (result) {
                if (result.status === "failed") {
                    errorsReport += "\nFAIL ".concat(testResult.testFilePath, "\n");
                    result.failureMessages.forEach(function (failureMessage) {
                        errorsReport += "  \u25CF ".concat(result.ancestorTitles.join(" › "), " \u203A ").concat(result.title, "\n\n");
                        errorsReport += "    ".concat(_this.cleanText(failureMessage), "\n");
                    });
                }
            });
        });
        return { report: report.trim(), errorsReport: errorsReport.trim() };
    };
    CustomReporter.prototype._formatFinalSummary = function (results) {
        var _a, _b, _c, _d;
        var numTotalTestSuites = results.numTotalTestSuites;
        var numPassedTestSuites = results.numPassedTestSuites;
        var numFailedTestSuites = results.numFailedTestSuites;
        var numTotalTests = results.numTotalTests;
        var numPassedTests = results.numPassedTests;
        var numFailedTests = results.numFailedTests;
        var numTotalSnapshots = results.snapshot.total;
        var time = (((_b = (_a = results.testResults[0]) === null || _a === void 0 ? void 0 : _a.perfStats) === null || _b === void 0 ? void 0 : _b.end) -
            ((_d = (_c = results.testResults[0]) === null || _c === void 0 ? void 0 : _c.perfStats) === null || _d === void 0 ? void 0 : _d.start)) /
            1000 || 0;
        var estimatedTime = results.startTime
            ? (Date.now() - results.startTime) / 1000
            : 0;
        return ("Test Suites: ".concat(numFailedTestSuites, " failed, ").concat(numPassedTestSuites, " passed, ").concat(numTotalTestSuites, " total\n") +
            "Tests:       ".concat(numFailedTests, " failed, ").concat(numPassedTests, " passed, ").concat(numTotalTests, " total\n") +
            "Snapshots:   ".concat(numTotalSnapshots, " total\n") +
            "Time:        ".concat(time.toFixed(3), "s, estimated ").concat(estimatedTime.toFixed(0), "s\n"));
    };
    CustomReporter.prototype.cleanText = function (text) {
        return text.replace(/\u001b\[\d+m/g, "");
    };
    return CustomReporter;
}());
module.exports = CustomReporter;
