/**
 * Formats a numeric value into USD currency format ($XX.YY).
 * @param {number} amount
 * @returns {string}
 */
export function formatCurrency(amount) {
  if (typeof amount !== 'number' || isNaN(amount)) {
    return '$0.00';
  }
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

/**
 * Returns a human-friendly stock status label and color variant.
 * @param {number} stock
 * @returns {{ label: string, variant: 'success' | 'warning' | 'danger' }}
 */
export function getStockStatus(stock) {
  if (typeof stock !== 'number' || stock <= 0) {
    return { label: 'Out of stock', variant: 'danger' };
  }
  if (stock <= 10) {
    return { label: `Low (${stock})`, variant: 'warning' };
  }
  return { label: `In stock (${stock})`, variant: 'success' };
}
