/**
 * String formatting and manipulation helpers.
 */

/**
 * Capitalizes the first letter of a string.
 */
export const capitalize = (str: string = ''): string => {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
};

/**
 * Returns a display title from an item, prioritizing its description,
 * falling back to its category, truncated to a readable length.
 */
export const getItemTitle = (
  item?: { description?: string; category?: string } | null,
  maxLength: number = 80
): string => {
  const text = item?.description?.trim() || item?.category || 'Untitled item';
  return text.slice(0, maxLength);
};
