type BoolTest = [message: string, condition: boolean];

export default function
runTestSuite(name: string, tests: () => Array<BoolTest>, skip?: boolean): void {
  if (!skip) {
    console.log(`Running test suite "${name}":`);
    for (const test of tests()) {
      if (test[1]) {
        console.log("✅ TEST PASSED:", test[0]);
      } else {
        console.log("❌ TEST FAILED:", test[0]);
      }
    }
  }
}
