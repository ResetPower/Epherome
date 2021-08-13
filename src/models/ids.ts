let cursor = -1;
const characters =
  "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz1234567890_$";
const cLength = characters.length;

export function shortid(): string {
  cursor++;
  return `${cursor}_${characters[Math.floor(Math.random() * cLength)]}`;
}
