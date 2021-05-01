import { getById, getNextId, WithId } from "../src/tools/arrays";

interface InnerInterface extends WithId {
  text: string;
}

const array: InnerInterface[] = [
  { id: 5, text: "Hello!" },
  { id: 9, text: "Hola!" },
  { id: 13, text: "Oh my god" },
];

test("get by id", () => {
  expect((getById(array, 13) ?? { id: -1, text: "null" }).text).toBe("Oh my god");
});

test("get next id", () => {
  expect(getNextId(array)).toBe(14);
});
