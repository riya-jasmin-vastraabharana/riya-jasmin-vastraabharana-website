export const formatCurrency = (amount: number): string =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);

export const getDiscountPercent = (price: number, original: number): number =>
  Math.round((1 - price / original) * 100);

export const calculateShipping = (total: number): number =>
  total >= 1999 ? 0 : 99;

export const generateOrderNumber = (): string => {
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const random = Math.floor(Math.random() * 9000) + 1000;
  return `RJV-${date}-${random}`;
};
