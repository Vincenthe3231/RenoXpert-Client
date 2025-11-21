const MONTH_NAMES = [
  'JAN',
  'FEB',
  'MAR',
  'APR',
  'MAY',
  'JUN',
  'JUL',
  'AUG',
  'SEP',
  'OCT',
  'NOV',
  'DEC',
];

/**
 * Formats a date string to "DD MMM YYYY HH:mm"
 * @param dateString - ISO date string (e.g., "2025-11-20T04:44:31.000000Z")
 * @returns Formatted string like "20 NOV 2025 16:44"
 */
export const toDateTime = (dateString: string): string => {
  const date = new Date(dateString);
  const day = date.getDate().toString().padStart(2, '0');
  const month = MONTH_NAMES[date.getMonth()];
  const year = date.getFullYear();
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');

  return `${day} ${month} ${year} ${hours}:${minutes}`;
};

/**
 * Formats a date string to "DD MMM YYYY HH:mm:ss"
 * @param dateString - ISO date string (e.g., "2025-11-20T04:44:31.000000Z")
 * @returns Formatted string like "20 NOV 2025 16:44:20"
 */
export const toDateTimePrecise = (dateString: string): string => {
  const date = new Date(dateString);
  const day = date.getDate().toString().padStart(2, '0');
  const month = MONTH_NAMES[date.getMonth()];
  const year = date.getFullYear();
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  const seconds = date.getSeconds().toString().padStart(2, '0');

  return `${day} ${month} ${year} ${hours}:${minutes}:${seconds}`;
};

/**
 * Formats a date string to "DD MMM YYYY"
 * @param dateString - ISO date string (e.g., "2025-11-20T04:44:31.000000Z")
 * @returns Formatted string like "20 NOV 2025"
 */
export const toDate = (dateString: string): string => {
  const date = new Date(dateString);
  const day = date.getDate().toString().padStart(2, '0');
  const month = MONTH_NAMES[date.getMonth()];
  const year = date.getFullYear();

  return `${day} ${month} ${year}`;
};

/**
 * Formats a date string to "HH:mm"
 * @param dateString - ISO date string (e.g., "2025-11-20T04:44:31.000000Z")
 * @returns Formatted string like "16:44"
 */
export const toTime = (dateString: string): string => {
  const date = new Date(dateString);
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');

  return `${hours}:${minutes}`;
};

/**
 * Formats a date string to "HH:mm:ss"
 * @param dateString - ISO date string (e.g., "2025-11-20T04:44:31.000000Z")
 * @returns Formatted string like "16:44:20"
 */
export const toTimePrecise = (dateString: string): string => {
  const date = new Date(dateString);
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  const seconds = date.getSeconds().toString().padStart(2, '0');

  return `${hours}:${minutes}:${seconds}`;
};

/**
 * Formats a date string to "DD MMM"
 * @param dateString - ISO date string (e.g., "2025-11-20T04:44:31.000000Z")
 * @returns Formatted string like "20 NOV"
 */
export const toMonthDate = (dateString: string): string => {
  const date = new Date(dateString);
  const day = date.getDate().toString().padStart(2, '0');
  const month = MONTH_NAMES[date.getMonth()];

  return `${day} ${month}`;
};

