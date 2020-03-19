export function padLeft(
    value: {toString: () => string}, width: number, char = ' ') {
  const str = value.toString();
  return char.repeat(Math.max(0, width - str.length)) + str;
}
