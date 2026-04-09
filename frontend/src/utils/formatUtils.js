/**
 * Formats a numeric amount based on user localization settings.
 * @param {number|string} amount - The numeric value to format.
 * @param {object} settings - The application settings containing localization info.
 * @returns {string} - The formatted currency string.
 */
export const formatCurrency = (amount, settings) => {
  if (amount === undefined || amount === null) amount = 0;

  // Handle string amounts with symbols already present
  let numericValue = typeof amount === 'string'
    ? parseFloat(amount.replace(/[^0-9.-]+/g, ""))
    : amount;

  if (isNaN(numericValue)) numericValue = 0;

  const localization = settings?.localization;
  const symbol = localization?.currencySymbol || '$';

  // Format with thousand separators and 2 decimal places if needed
  const formattedValue = new Intl.NumberFormat(localization?.locale || 'en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
    useGrouping: true
  }).format(numericValue);

  // The user requested: `${symbol} ${value}`
  return `${symbol} ${formattedValue}`.trim();
};

