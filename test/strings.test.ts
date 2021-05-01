import { removePrefix, removeSuffix } from "../src/tools/strings";

test("prefix and suffix remover", () => {
  const text = "Hello, World!";
  expect(removePrefix(text, "pre")).toBe(text);
  expect(removePrefix(text, "Hello, ")).toBe(text.substring(7, text.length));
  expect(removeSuffix(text, "suf")).toBe(text);
  expect(removeSuffix(text, ", World!")).toBe(text.substring(0, 5));
});
