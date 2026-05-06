/** Applied to package + add-ons before payment (excludes future discounts). */
export const CHECKOUT_TAX_RATE = 0.05;

export function applyCheckoutTax(subtotalInr: number): {
  subtotalInr: number;
  taxInr: number;
  totalInr: number;
} {
  const subtotal = Math.round(subtotalInr);
  const taxInr = Math.round(subtotal * CHECKOUT_TAX_RATE);
  return {
    subtotalInr: subtotal,
    taxInr,
    totalInr: subtotal + taxInr,
  };
}
