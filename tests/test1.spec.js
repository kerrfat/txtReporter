"use strict";
describe("First Suite", function () {
    describe("Nested Suite 1", function () {
        for (var i = 1; i <= 10; i++) {
            it("Test ".concat(i), function () {
                // Test logic here
            });
        }
    });
    describe("Nested Suite 2", function () {
        for (var i = 11; i <= 20; i++) {
            it("Test ".concat(i), function () {
                // Test logic here
            });
        }
    });
});
