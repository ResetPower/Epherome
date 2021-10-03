let cursor = -1;

export function shortid(): number {
  cursor++;
  return cursor;
}
