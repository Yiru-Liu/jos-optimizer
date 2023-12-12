"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function runTestSuite(name, tests, skip) {
    if (!skip) {
        console.log("Running test suite \"".concat(name, "\":"));
        for (var _i = 0, _a = tests(); _i < _a.length; _i++) {
            var test = _a[_i];
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
