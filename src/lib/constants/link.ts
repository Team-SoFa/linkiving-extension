export const MAX_TITLE_LENGTH = 100;
export const MAX_MEMO_LENGTH = 200;

// Keep the textarea UTF-16 limit without leaving half of a surrogate pair.
export const truncateLinkTitle = (value: string) =>
  value.slice(0, MAX_TITLE_LENGTH).replace(/[\uD800-\uDBFF]$/, '');
