import testSuite from "./tester";

export function centsToStr(cents: number): string {
  return "$" + (cents / 100).toFixed(2);
}

type Cart = [quantities: Array<number>, total: number];

class TravelBag {
  seen_list: Set<string>;
  collected: Array<Cart>;

  constructor() {
    this.seen_list = new Set();
    this.collected = [];
  }

  has_seen(ct: Cart): boolean {
    return this.seen_list.has(JSON.stringify(ct[0]));
  }

  see(ct: Cart): void {
    this.seen_list.add(JSON.stringify(ct[0]));
  }

  collect(ct: Cart): void {
    this.collected.push(ct);
  }
}

export class Recommender {
  itemPrices: Array<number>;
  budget: number;

  constructor(item_prices: Array<number>, budget: number) {
    this.itemPrices = item_prices;
    this.budget = budget;
  }

  /**
   * Creates an empty cart.
   * @returns an empty cart
   */
  emptyCart(): Cart {
    return [this.itemPrices.map(() => 0), 0];
  }

  /**
   * Checks whether a given cart is empty.
   * @param ct the cart to check
   * @returns whether the cart is empty
   */
  static cartIsEmpty(ct: Cart): boolean {
    return ct[1] === 0;
  }

  /**
   * Given a cart, returns all carts with one more item added that fits in the
   * budget.
   * @param ct The cart to start with
   * @returns
   */
  cartNexts(ct: Cart): Array<Cart> {
    const nextCarts: Array<Cart> = [];
    this.itemPrices.forEach((price, itemIndex) => {
      const newTotal = ct[1] + price;
      if (newTotal <= this.budget) {
        const newQuantities = [...ct[0]];
        newQuantities[itemIndex]++;
        nextCarts.push([newQuantities, newTotal]);
      }
    });
    return nextCarts;
  }

  allFilledCarts(): Array<Cart> {
    const travelBag = new TravelBag();
    const traverseSubcarts = (current_ct: Cart): void => {
      if (!travelBag.has_seen(current_ct)) {
        travelBag.see(current_ct);
        const subcarts = this.cartNexts(current_ct);
        if (subcarts.length === 0) {
          travelBag.collect(current_ct);
        } else {
          subcarts.forEach(subcart => traverseSubcarts(subcart));
        }
      }
    }
    traverseSubcarts(this.emptyCart());
    return travelBag.collected;
  }
}
