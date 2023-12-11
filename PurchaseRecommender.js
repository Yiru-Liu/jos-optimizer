"use strict";

const RUN_TESTS = true;

const test_suite = (name, tests, skip) => {
    if (!skip) {
        console.log("Running test suite " + name + "...");
        tests();
    }
}

const run_test = (message, condition) => {
    if (condition) {
        console.log("✅ TEST PASSED:", message);
    } else {
        console.log("❌ TEST FAILED:", message);
    }
};

/**
 * Given an integer number of cents, returns a string representation of the
 * amount in dollars.
 * @param {number} cents An integer number of cents
 * @returns {string}
 */
const centsToStr = (cents) => {
    return "$" + (cents / 100).toFixed(2)
}

/**
 * A cart of items, where the key is the price and the value is the number.
 * @typedef {Immutable.Map<number, number>} Cart
 */

const empty_cart = new Immutable.Map();

/**
 * Checks whether the cart is empty.
 * @param {Cart} cart
 * @returns {boolean} whether the cart is empty
 */
const cart_is_empty = (cart) => {
    return cart.size === 0;
};

/**
 * Adds an item of the given price to the given cart.
 * @param {Cart} cart
 * @param {number} price
 * @returns {Cart} cart after adding the item
 */
const cart_add = (cart, price) => {
    const current_num = cart.get(price);
    if (current_num === undefined) {
        return cart.set(price, 1);
    } else {
        return cart.set(price, current_num + 1);
    }
};

/**
 * Calculates the total value of all items in the cart.
 * @param {Cart} cart
 * @returns {number}
 */
const cart_total = (cart) => {
    let total = 0;
    cart.forEach((value, key) => {
        total += key * value;
    });
    return total;
}

/**
 * Returns a human-readable string representation of the items in the cart.
 * @param {Cart} cart
 * @returns {string}
 */
const cart_to_str = (cart) => {
    let answer = "";
    const entries = Array.from(cart.entries());
    entries.sort((a, b) => a[0] - b[0]);
    for (const entry of entries) {
        const price = entry[0];
        const num = entry[1];
        answer += num + " \u00d7 " + centsToStr(price) + "; ";
    }
    return answer.substring(0, answer.length - 2);
}

test_suite("for cart_to_str", () => {
    run_test("String of cart with one item",
        cart_to_str(Immutable.Map([[275, 1]])) === "1 \u00d7 $2.75");
    run_test("String of cart with multiple items",
        cart_to_str(Immutable.Map([[275, 1], [250, 3], [300, 2]])) ===
        "3 \u00d7 $2.50; 1 \u00d7 $2.75; 2 \u00d7 $3.00");
}, !RUN_TESTS);

test_suite("for cart operations", () => {
    run_test("Empty cart has 0 value", cart_total(empty_cart) === 0);
    run_test("Empty cart is empty", cart_is_empty(empty_cart));
    const cart_with_1 = cart_add(empty_cart, 275);
    run_test("1 item added", cart_total(cart_with_1) === 275);
    const cart_with_another = cart_add(cart_with_1, 275);
    run_test("Same price added", cart_total(cart_with_another) === 550);
    const cart_with_different = cart_add(cart_with_another, 150);
    run_test("Different price added", cart_total(cart_with_different) === 700);
    run_test("Carts with items are not empty",
        !(cart_is_empty(cart_with_1) || cart_is_empty(cart_with_another)
            || cart_is_empty(cart_with_different))
    );
}, !RUN_TESTS);

class TravelBag {
    seen_list;
    collected;

    /**
     * Creates a TravelBag.
     * @param {Immutable.Set<Cart>} [seen_list]
     * @param {Immutable.Set<Cart>} [collected]
     */
    constructor(seen_list, collected) {
        if (arguments.length) {
            this.seen_list = seen_list;
            this.collected = collected;
        } else {
            this.seen_list = new Immutable.Set();
            this.collected = new Immutable.Set();
        }
    }

    /**
     * Checks whether the given item has already been seen.
     * @param {Cart} item
     * @returns {boolean}
     */
    has_seen(item) {
        return this.seen_list.has(item);
    }

    /**
     * Adds the given item to the seen list.
     * @param {Cart} item
     */
    see(item) {
        this.seen_list = this.seen_list.add(item);
    }

    /**
     * Adds the given item to the collected and the seen list.
     * @param {Cart} item
     */
    collect(item) {
        this.see(item);
        this.collected = this.collected.add(item);
    }
}

const ReportRow = Immutable.Record({
    cart: undefined,
    used: undefined,
    remaining: undefined,
    efficiency: undefined
});

class PurchaseRecommender {
    item_prices;
    budget;

    /**
     * Creates a PurchaseRecommender.
     * @param {Immutable.Set<number>} item_prices The set of available prices
     * @param {number} budget The total value that no cart is to exceed
     */
    constructor(item_prices, budget) {
        this.item_prices = item_prices;
        this.budget = budget;
    }

    /**
     * Given a cart, returns the set of all carts with another item added that
     * is within the budget.
     * @param {Cart} current_cart
     * @returns {Immutable.Set<Cart>}
     */
    next_purchases(current_cart) {
        const possible_next_carts = this.item_prices.map(price =>
            cart_add(current_cart, price));
        const valid_carts = possible_next_carts.filter(cart =>
            cart_total(cart) <= this.budget);
        return valid_carts;
    }

    /**
     * Returns all possible filled carts.
     * @returns {Immutable.Set<Cart>}
     */
    all_filled_carts() {
        const travel_bag = new TravelBag();
        const all_filled_subcarts = (current_cart) => {
            if (!travel_bag.has_seen(current_cart)) {
                const subcarts = this.next_purchases(current_cart);
                if (subcarts.size === 0) {
                    travel_bag.collect(current_cart);
                } else {
                    subcarts.forEach(subcart => all_filled_subcarts(subcart));
                    travel_bag.see(current_cart);
                }
            }
        };
        all_filled_subcarts(empty_cart);
        return travel_bag.collected;
    }

    /**
     * Returns a table of all possible filled carts, sorted so the most
     * efficient are first.
     * @returns {Array<Immutable.Record>}
     */
    carts_report() {
        const afc = this.all_filled_carts();
        const table = [];
        afc.forEach((ct) => {
            const total = cart_total(ct);
            table.push(ReportRow({
                cart: ct,
                used: total,
                remaining: this.budget - total,
                efficiency: 100 * total / this.budget
            }));
        })
        table.sort((a, b) => b["efficiency"] - a["efficiency"]);
        return table;
    }
}

test_suite("for all_filled_carts", () => {
    run_test("Only enough space for one",
        (new PurchaseRecommender(Immutable.Set([125]), 125))
            .all_filled_carts().equals(Immutable.Set([
                Immutable.Map([[125, 1]])
            ]))
    );
    run_test("Perfect space for two",
        (new PurchaseRecommender(Immutable.Set([125]), 250))
            .all_filled_carts().equals(Immutable.Set([
                Immutable.Map([[125, 2]])
            ]))
    );
    run_test("Space for two, with some space left over",
        (new PurchaseRecommender(Immutable.Set([100]), 250))
            .all_filled_carts().equals(Immutable.Set([
                Immutable.Map([[100, 2]])
            ]))
    );
    run_test("Multiple possibilities",
        (new PurchaseRecommender(Immutable.Set([100, 125, 150]), 250))
            .all_filled_carts().equals(Immutable.Set([
                Immutable.Map([[100, 2]]),
                Immutable.Map([[100, 1], [125, 1]]),
                Immutable.Map([[100, 1], [150, 1]]),
                Immutable.Map([[125, 2]])
            ]))
    );
}, !RUN_TESTS);

test_suite("for carts_report", () => {
    run_test("Report with only one",
        JSON.stringify(
            (new PurchaseRecommender(Immutable.Set([125]), 125)).carts_report()
        )
        ===
        JSON.stringify([ReportRow({
            cart: Immutable.Map([[125, 1]]),
            used: 125,
            remaining: 0,
            efficiency: 100
        })])
    );
    run_test("Report with multiple",
        JSON.stringify(
            (new PurchaseRecommender(Immutable.Set([100, 125, 150]), 250))
                .carts_report()
        )
        ===
        JSON.stringify([
            ReportRow({
                cart: Immutable.Map([[100, 1], [150, 1]]),
                used: 250,
                remaining: 0,
                efficiency: 100
            }),
            ReportRow({
                cart: Immutable.Map([[125, 2]]),
                used: 250,
                remaining: 0,
                efficiency: 100
            }),
            ReportRow({
                cart: Immutable.Map([[100, 1], [125, 1]]),
                used: 225,
                remaining: 25,
                efficiency: 90
            }),
            ReportRow({
                cart: Immutable.Map([[100, 2]]),
                used: 200,
                remaining: 50,
                efficiency: 80
            })
        ])
    )
}, !RUN_TESTS);
