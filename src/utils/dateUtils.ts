/**
 * Date utility helpers for item reporting and calculation.
 */

/**
 * Returns an ISO date string (YYYY-MM-DD) for a given offset in days from today.
 *
 * @param offsetDays - Number of days to subtract from today (0 = today, 1 = yesterday)
 * @returns Date formatted as YYYY-MM-DD
 */
export const getIsoDate = (offsetDays: number = 0): string => {
  const now = new Date();
  now.setDate(now.getDate() - offsetDays);
  return new Date(now.getTime() - now.getTimezoneOffset() * 60000)
    .toISOString()
    .slice(0, 10);
};

/**
 * Converts a YYYY-MM-DD date string to day number count for simple date diffing.
 *
 * @param dateStr - Date string in YYYY-MM-DD format
 * @returns Days elapsed since UNIX epoch
 */
export const getDayNumber = (dateStr: string): number => {
  return Date.parse(`${dateStr}T00:00:00Z`) / 864e5;
};
