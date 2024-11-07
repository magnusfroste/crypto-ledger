export const formatNumber = (value: number, decimals: number = 3): string => {
  return value.toLocaleString('sv-SE', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  });
};

export const formatCurrency = (value: number, currency: string = 'SEK', decimals: number = 3): string => {
  return `${currency} ${formatNumber(value, decimals)}`;
};

export const formatPercentage = (value: number, decimals: number = 2): string => {
  return `${formatNumber(value, decimals)}%`;
}; 