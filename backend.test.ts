import { Recommender } from "./backend";

test("Recommender validates inputs", () => {
  expect(() => new Recommender([], [], 1)).toThrow("pricelist cannot be empty");
  expect(() => new Recommender([275], [0, 0], 1125))
    .toThrow("length of minimums does not match length of pricelist");
  expect(() => new Recommender([-275], [1], 1125))
    .toThrow("prices must be positive (got -275)");
})
