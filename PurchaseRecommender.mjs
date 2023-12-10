"use strict";

/** Class representing items to purchase. */
class PurchaseCart {
    contents;

    /**
     * Create a PurchaseCart.
     * @param {Immutable.Map<number, number>} [contents]
     */
    constructor(contents) {
        if (arguments.length) {
            this.contents = contents;
        } else {
            this.contents = new Immutable.Map();
        }
        Object.freeze(this);
    }

    /**
     * Checks whether this cart is empty.
     * @returns {boolean} whether the cart is empty
     */
    is_empty() {
        return this.contents.size == 0;
    }

    /**
     * Returns a new PurchaseCart with another item added.
     * @param {number} price_to_purchase - the price of the item to add
     * @returns a new PurchaseCart with that item added
     */
    purchase_another(price_to_purchase) {
        const current_num = this.contents.get(price_to_purchase);
        if (current_num == undefined) {
            return new PurchaseCart(new_contents.set(price_to_purchase, 1));
        } else {
            return new PurchaseCart(
                new_contents.set(price_to_purchase, current_num + 1));
        }
    }

    /**
     * Returns the total value of all items in the cart.
     * @returns {number} the total value of all items in the cart
     */
    total_price() {
        let total = 0;
        this.contents.forEach((value, key) => {
            total += key * value;
        });
        return total;
    }
}

class TravelBag {
    seen_list;
    collection;

    constructor() {
        this.seen_list = new Immutable.Set();
        this.collection = new Set();
    }

    has_seen(item) {
        return this.seen_list.has(item);
    }

    see(item) {
        this.seen_list = this.seen_list.add(item);
    }

    add_to_collection(item) {
        this.see(item);
        this.collection.add(item);
    }
}

/** Class that, given a set of item prices and a budget,
 * recommends purchases. */
class PurchaseRecommender {
    item_prices;
    budget;

    /**
     * Creates a PurchaseRecommender.
     * @param {Set<number>} item_prices Set of item prices available
     * @param {number} budget Price each cart is not to exceed
     */
    constructor(item_prices, budget) {
        this.item_prices = item_prices;
        this.budget = budget;
    }

    /**
     * Returns all carts with one item added that are in budget.
     * @param {PurchaseCart} current_cart - the current cart
     * @returns {Set<PurchaseCart>} the set of all carts with one item added
     * that are within budget
     */
    next_purchases(current_cart) {
        const next_carts = new Set();
        this.item_prices.forEach((price) => {
            const next_cart = current_cart.purchase_another(price);
            if (next_cart.total_price() <= this.budget) {
                next_carts.add(next_cart);
            }
        });
        return next_carts;
    }

    /**
     * Returns all filled carts that can be bought.
     * @returns {Set<PurchaseCart>} all filled carts that can be bought
     */
    all_filled_carts() {
        const travel_bag = new TravelBag();
        const traverse_subcarts = (current_cart) => {
            if (!travel_bag.has_seen(current_cart)) {
                const next_carts = this.next_purchases(current_cart);
                if (next_carts.size == 0) {
                    travel_bag.add_to_collection(current_cart);
                } else {
                    next_carts.forEach((cart) => {
                        traverse_subcarts(cart);
                    });
                    travel_bag.see(current_cart);
                }
            }
        };
        traverse_subcarts(new PurchaseCart());
        return travel_bag.collection;
    }

    /**
     * Returns an array of all possible filled carts
     * sorted in descending order by efficiency.
     * @returns {Array<[PurchaseCart, number, number, number]>}
     * each filled cart, the amount used, the amount left in the budget, and
     * the efficiency as a percentage
     */
    carts_report() {
        const all_filled = this.all_filled_carts();
        const report = [];
        all_filled.forEach((cart) => {
            const total_price = cart.total_price();
            report.push([cart, total_price, this.budget - total_price,
                100 * total_price / this.budget])
        });
        report.sort((a, b) => {
            return b[3] - a[3];
        });
        return report;
    }
}

const pc = new PurchaseCart()
console.log(pc);
console.log(JSON.stringify(pc));
const pc_150 = pc.purchase_another(150);
console.log(pc_150);
console.log(JSON.stringify(pc_150));
