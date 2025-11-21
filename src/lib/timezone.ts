/**
 * Get the user's local timezone
 */
export const getUserTimezone = (): string => {
  return Intl.DateTimeFormat().resolvedOptions().timeZone;
};

/**
 * Get today's date in user's timezone formatted as YYYY-MM-DD
 */
export const getTodayInUserTimezone = (): string => {
  const userTimezone = getUserTimezone();
  const now = new Date();
  
  // Format date in user's timezone
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: userTimezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
  
  return formatter.format(now); // Returns YYYY-MM-DD
};

/**
 * Format a date string for display in user's timezone
 */
export const formatDateInUserTimezone = (dateString: string): string => {
  const userTimezone = getUserTimezone();
  const date = new Date(dateString + 'T00:00:00');
  
  return date.toLocaleDateString("en-US", {
    timeZone: userTimezone,
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};
