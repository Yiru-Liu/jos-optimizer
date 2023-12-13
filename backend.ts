type Cart = number[];
interface Report {
  cart: Cart,
  cartStr: string,
  variety: number,
  amountUsed: number,
  amountRemaining: number,
  efficiency: number
}

function variance(data: number[]): number {
  const firstMoment = data.reduce((acc, elt) => acc + elt) / data.length;
  const secondMoment
    = data.map(x => x * x).reduce((acc, elt) => acc + elt) / data.length;
  return secondMoment - (firstMoment * firstMoment);
}

function centsToStr(cents: number): string {
  return "$" + (cents / 100).toFixed(2);
}

export class Recommender {
  pricelist: number[];
  minimums: number[];
  budget: number;
  allFilledCarts: Cart[];
  allReports: Report[];

  constructor(pricelist: number[], minimums: Cart, budget: number) {
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

    this.pricelist = pricelist.toSorted((a, b) => a - b);
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
        cartStr: this.cartToStr(ct),
        variety: 1 / variance(ct),
        amountUsed: total,
        amountRemaining: this.budget - total,
        efficiency: total / this.budget
      }
    });

    Object.freeze(this);
  }

  cartTotal(ct: Cart): number {
    let total = 0;
    ct.forEach((quantity, i) => total += quantity * this.pricelist[i]);
    return total;
  }

  fitsBudget(ct: Cart): boolean {
    return this.cartTotal(ct) <= this.budget;
  }

  maxCheapest(ct: Cart): Cart {
    if (ct[0] !== this.minimums[0]) {
      throw new Error(`Cart does not have minimum of cheapest (expected ${this.minimums[0]}, got ${ct[0]})`);
    }
    const newCart = [...ct];
    const currentTotal = this.cartTotal(newCart);
    const budgetRemaining = this.budget - currentTotal;
    const numCheapestCanFit = Math.floor(budgetRemaining / this.pricelist[0]);
    newCart[0] = numCheapestCanFit;
    return newCart;
  }

  nextPermute(ct: Cart, index: number): Cart | null {
    if (!this.fitsBudget(ct)) {
      throw new Error(`Cart already exceeds budget: ${ct}`);
    }
    const newCart = [...ct];
    newCart[index]++;
    if (this.fitsBudget(newCart)) {
      return newCart;
    } else if ((index + 1) >= this.minimums.length) {
      return null;
    } else {
      newCart[index] = this.minimums[index];
      return this.nextPermute(newCart, index + 1);
    }
  }

  cartToStr(ct: Cart): string {
    return ct.map((quantity, i) =>
      `${quantity} \u00d7 ${centsToStr(this.pricelist[i])}`
    ).join("<br>")
  }
}
