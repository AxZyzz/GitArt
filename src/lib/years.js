// GitHub launched in 2008, so older target years are not useful for profile art.
export const MIN_YEAR = 2008;
export const MAX_YEAR = new Date().getFullYear() + 1;

// Newest first keeps the most likely choices at the top of the dropdown.
export const YEARS = Array.from(
  { length: MAX_YEAR - MIN_YEAR + 1 },
  (_, index) => MAX_YEAR - index,
);
