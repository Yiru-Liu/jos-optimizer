function sum(data) {
    return data.reduce((a, b) => a + b, 0);
}
function dotProduct(vec1, vec2) {
    return sum(vec1.map((n, i) => n * vec2[i]));
}
export function centsToStr(cents) {
    return "$" + (cents / 100).toFixed(2);
}
export class Recommender {
    pricelist;
    minimums;
    budget;
    allFilledCarts;
    allReports;
    constructor(pricelist, minimums, budget) {
        if (pricelist.length === 0) {
            throw new Error("pricelist cannot be empty");
        }
        if (pricelist.length !== minimums.length) {
            throw new Error("length of minimums does not match length of pricelist");
        }
        pricelist.forEach((price) => {
            if (price <= 0) {
                throw new Error(`prices must be positive (got ${price})`);
            }
            if (!Number.isInteger(price)) {
                throw new Error(`prices must be integers (got ${price})`);
            }
        });
        minimums.forEach((min) => {
            if (min < 0) {
                throw new Error(`minimums must be non-negative (got ${min})`);
            }
            if (!Number.isInteger(min)) {
                throw new Error(`minimums must be integers (got ${min})`);
            }
        });
        if (budget <= 0) {
            throw new Error(`budget must be positive (got ${budget})`);
        }
        for (let i = 0; i < pricelist.length - 1; i++) {
            if (pricelist[i + 1] <= pricelist[i]) {
                throw new Error("Pricelist not sorted in ascending order");
            }
        }
        this.pricelist = pricelist;
        this.minimums = minimums;
        this.budget = budget;
        this.allFilledCarts = [];
        if (this.fitsBudget(this.minimums)) {
            let currentCart = this.maxCheapest(this.minimums);
            while (true) {
                this.allFilledCarts.push(currentCart);
                const nextCart = this.nextPermute(currentCart, 0);
                if (!nextCart) {
                    break;
                }
                currentCart = this.maxCheapest(nextCart);
            }
        }
        this.allReports = this.allFilledCarts.map(ct => {
            const total = this.cartTotal(ct);
            return {
                cart: ct,
                efficiency: 100 * total / this.budget
            };
        }).sort((a, b) => b.efficiency - a.efficiency);
        Object.freeze(this);
    }
    cartTotal(ct) {
        return dotProduct(ct, this.pricelist);
    }
    fitsBudget(ct) {
        return this.cartTotal(ct) <= this.budget;
    }
    maxCheapest(ct) {
        if (!this.fitsBudget(ct)) {
            throw new Error(`Cart already exceeds budget: ${ct}`);
        }
        if (ct[0] !== this.minimums[0]) {
            throw new Error(`Cart does not have minimum of cheapest (expected ${this.minimums[0]}, got ${ct[0]})`);
        }
        const newCart = [...ct];
        const currentTotal = this.cartTotal(newCart);
        const budgetRemaining = this.budget - currentTotal;
        const numCheapestCanFit = Math.floor(budgetRemaining / this.pricelist[0]);
        newCart[0] += numCheapestCanFit;
        return newCart;
    }
    nextPermute(ct, index) {
        if (!this.fitsBudget(ct)) {
            throw new Error(`Cart already exceeds budget: ${ct}`);
        }
        const newCart = [...ct];
        newCart[index]++;
        if (this.fitsBudget(newCart)) {
            return newCart;
        }
        else if ((index + 1) >= this.minimums.length) {
            return null;
        }
        else {
            newCart[index] = this.minimums[index];
            return this.nextPermute(newCart, index + 1);
        }
    }
    cartToStr(ct) {
        return ct.map((quantity, i) => `${quantity} \u00d7 ${centsToStr(this.pricelist[i])}`).join("<br>");
    }
}
