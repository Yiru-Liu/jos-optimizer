import { Recommender } from "./backend";

const oneCart = new Recommender([275], [0], 275);
const twoPerfect = new Recommender([275], [0], 550);
const twoWithSpace = new Recommender([425], [0], 1125);
const simpleMultiple = new Recommender([125, 100, 150], [0, 0, 0], 250);
const realMultiple = new Recommender([275, 300], [0, 0], 1125);

describe("Recommender validates inputs", () => {
  test("pricelist is empty", () => {
    expect(() => new Recommender([], [], 1))
      .toThrow("pricelist cannot be empty");
  });
  test("length of minimums does not match length of pricelist", () => {
    expect(() => new Recommender([275], [0, 0], 1125))
      .toThrow("length of minimums does not match length of pricelist");
  });
  test("negative price", () => {
    expect(() => new Recommender([-275], [1], 1125))
      .toThrow("prices must be positive (got -275)");
  });
});

test("Cart total calculated correctly", () => {
  expect(oneCart.cartTotal([1])).toBe(275);
  expect(oneCart.fitsBudget([1])).toBe(true);
});

describe("maxCheapest", () => {
  test("oneCart fills correctly", () => {
    expect(oneCart.maxCheapest([0])).toEqual([1]);
  });
  test("oneCart when parameter does not have the minimum cheapest", () => {
    expect(() => oneCart.maxCheapest([1])).toThrow(
      "Cart does not have minimum of cheapest (expected 0, got 1)"
    );
  });
  test("twoPerfect fills correctly", () => {
    expect(twoPerfect.maxCheapest([0])).toEqual([2]);
  });
  test("twoPerfect when parameter does not have the minimum cheapest", () => {
    expect(() => twoPerfect.maxCheapest([1])).toThrow(
      "Cart does not have minimum of cheapest (expected 0, got 1)"
    );
    expect(() => twoPerfect.maxCheapest([2])).toThrow(
      "Cart does not have minimum of cheapest (expected 0, got 2)"
    );
  });
  test("simpleMultiple from an empty cart", () => {
    expect(simpleMultiple.maxCheapest([0, 0, 0]))
      .toEqual([2, 0, 0]);
  });
  test("simpleMultiple from partially-filled carts", () => {
    expect(simpleMultiple.maxCheapest([0, 1, 0]))
      .toEqual([1, 1, 0]);
    expect(simpleMultiple.maxCheapest([0, 2, 0]))
      .toEqual([0, 2, 0]);
    expect(simpleMultiple.maxCheapest([0, 0, 1]))
      .toEqual([1, 0, 1]);
  });
})

describe("nextPermute", () => {
  test("oneCart from empty", () => {
    expect(oneCart.nextPermute([0], 0)).toEqual([1]);
    expect(oneCart.nextPermute([1], 1)).toBe(null);
  });
  test("simpleMultiple full permute", () => {
    expect(simpleMultiple.nextPermute([2, 0, 0], 0))
      .toEqual([0, 1, 0]);
    expect(simpleMultiple.nextPermute([0, 1, 0], 0))
      .toEqual([1, 1, 0]);
    expect(simpleMultiple.nextPermute([1, 1, 0], 0))
      .toEqual([0, 2, 0]);
    expect(simpleMultiple.nextPermute([0, 2, 0], 0))
      .toEqual([0, 0, 1]);
    expect(simpleMultiple.nextPermute([0, 0, 1], 0))
      .toEqual([1, 0, 1]);
    expect(simpleMultiple.nextPermute([1, 0, 1], 0))
      .toBe(null);
  })
});

describe("All filled carts generated correctly", () => {
  test("Only enough space for one", () => {
    expect(oneCart.allFilledCarts)
      .toEqual([[1]]);
  });
  test("Perfect space for two", () => {
    expect(twoPerfect.allFilledCarts)
      .toEqual([[2]]);
  });
  test("Space for two, with some space left over", () => {
    expect(twoWithSpace.allFilledCarts)
      .toEqual([[2]]);
  });
  test("Multiple possibilities", () => {
    expect(simpleMultiple.allFilledCarts)
      .toEqual([[2, 0, 0], [1, 1, 0], [0, 2, 0], [1, 0, 1]]);
  });
  test("Multiple possibilities with real-world data", () => {
    expect(realMultiple.allFilledCarts)
      .toEqual([[4, 0], [3, 1], [1, 2], [0, 3]]);
  });
});
