"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function runTestSuite(name, tests, skip) {
    if (!skip) {
        console.log("Running test suite ".concat(name, "..."));
        for (var _i = 0, tests_1 = tests; _i < tests_1.length; _i++) {
            var test = tests_1[_i];
            if (test[1]) {
                console.log("✅ TEST PASSED:", test[0]);
            }
            else {
                console.log("❌ TEST FAILED:", test[0]);
            }
        }
    }
}
exports.default = runTestSuite;
