"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Recommender = exports.centsToStr = void 0;
function centsToStr(cents) {
    return "$" + (cents / 100).toFixed(2);
}
exports.centsToStr = centsToStr;
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
        return [
            this.itemPrices.map(function () { return 0; }),
            0
        ];
    };
    /**
     * Checks whether a given cart is empty.
     * @param ct the cart to check
     * @returns whether the cart is empty
     */
    Recommender.cartIsEmpty = function (ct) {
        return ct[1] === 0;
    };
    // cartAdd(ct: Cart, itemIndex: number): Cart {
    //   const newQuantities = ct[0].map((oldQuantity, i) => {
    //     if (i === itemIndex) {
    //       return oldQuantity + 1;
    //     } else {
    //       return oldQuantity;
    //     }
    //   })
    //   const newTotal = ct[1] + this.itemPrices[itemIndex];
    //   return [newQuantities, newTotal];
    // }
    /**
     * Given a cart, returns all carts with one more item added that fits in the
     * budget.
     * @param ct The cart to start with
     * @returns
     */
    Recommender.prototype.cartNexts = function (ct) {
        var _this = this;
        return this.itemPrices.map(function (price, i) {
            return [
                ct[0].map(function (oldQuantity, qi) {
                    if (qi == i) {
                        return oldQuantity + 1;
                    }
                    else {
                        return oldQuantity;
                    }
                }),
                ct[1] + price
            ];
        }).filter(function (cart) { return cart[1] <= _this.budget; });
    };
    return Recommender;
}());
exports.Recommender = Recommender;
