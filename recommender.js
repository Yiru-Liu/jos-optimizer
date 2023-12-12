"use strict";
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Recommender = exports.centsToStr = void 0;
var tester_1 = require("./tester");
function centsToStr(cents) {
    return "$" + (cents / 100).toFixed(2);
}
exports.centsToStr = centsToStr;
var TravelBag = /** @class */ (function () {
    function TravelBag() {
        this.seen_list = new Set();
        this.collected = [];
    }
    TravelBag.prototype.has_seen = function (ct) {
        return this.seen_list.has(JSON.stringify(ct[0]));
    };
    TravelBag.prototype.see = function (ct) {
        this.seen_list.add(JSON.stringify(ct[0]));
    };
    TravelBag.prototype.collect = function (ct) {
        this.collected.push(ct);
    };
    return TravelBag;
}());
var Recommender = /** @class */ (function () {
    function Recommender(item_prices, budget) {
        this.itemPrices = item_prices;
        this.budget = budget;
    }
    /**
     * Creates an empty cart.
     * @returns an empty cart
     */
    Recommender.prototype.emptyCart = function () {
        return [this.itemPrices.map(function () { return 0; }), 0];
    };
    /**
     * Checks whether a given cart is empty.
     * @param ct the cart to check
     * @returns whether the cart is empty
     */
    Recommender.cartIsEmpty = function (ct) {
        return ct[1] === 0;
    };
    /**
     * Given a cart, returns all carts with one more item added that fits in the
     * budget.
     * @param ct The cart to start with
     * @returns
     */
    Recommender.prototype.cartNexts = function (ct) {
        var _this = this;
        var nextCarts = [];
        this.itemPrices.forEach(function (price, itemIndex) {
            var newTotal = ct[1] + price;
            if (newTotal <= _this.budget) {
                var newQuantities = __spreadArray([], ct[0], true);
                newQuantities[itemIndex]++;
                nextCarts.push([newQuantities, newTotal]);
            }
        });
        return nextCarts;
    };
    Recommender.prototype.allFilledCarts = function () {
        var _this = this;
        var travelBag = new TravelBag();
        var traverseSubcarts = function (current_ct) {
            if (!travelBag.has_seen(current_ct)) {
                travelBag.see(current_ct);
                var subcarts = _this.cartNexts(current_ct);
                if (subcarts.length === 0) {
                    travelBag.collect(current_ct);
                }
                else {
                    subcarts.forEach(function (subcart) { return traverseSubcarts(subcart); });
                }
            }
        };
        traverseSubcarts(this.emptyCart());
        return travelBag.collected;
    };
    return Recommender;
}());
exports.Recommender = Recommender;
(0, tester_1.default)("Cart operations", function () {
    var testReccer = new Recommender([150, 275], 500);
    var emptyCart = testReccer.emptyCart();
    var cart1stGen = testReccer.cartNexts(emptyCart);
    // const cart2ndGen = testReccer.cartNexts(cart1stGen[0]);
    // const cart3rdGen = testReccer.cartNexts(cart2ndGen[1]);
    return [
        ["Empty cart is empty",
            JSON.stringify(emptyCart) === "[[0,0],0]"],
        ["All carts with 1 item",
            JSON.stringify(cart1stGen) === "[[[1,0],150],[[0,1],275]]"]
    ];
});
