import assert from "assert";
import {
  getById,
  getNextId,
  WithId,
  obj2form,
  unwrapFunction,
  appendZero,
  removePrefix,
  removeSuffix,
  replaceAll,
} from "../src/tools";

interface MyStructWithId extends WithId {
  name: string;
}

const arr: MyStructWithId[] = [
  { id: 2, name: "a" },
  { id: 3, name: "b" },
];

describe("tools", function () {
  describe("arrays", function () {
    it("gets object by id", function () {
      assert(getById(arr, 2)?.name === "a");
      assert(getById(arr, 3)?.name === "b");
    });
    it("gets next id", function () {
      assert(getNextId(arr) === 4);
    });
  });
  describe("objects", function () {
    describe("#unwrapFunction", function () {
      it("returns empty function if arg is undefined", function () {
        const result0 = unwrapFunction(undefined);
        assert(result0);
      });
      it("returns arg if arg is not undefined", function () {
        const func = () => {
          /**/
        };
        const result1 = unwrapFunction(func);
        assert(result1 === func);
      });
    });
    it("transfers obj to form", function () {
      const obj = {
        a: "a",
        b: "b",
      };
      assert(obj2form(obj) === "a=a&b=b");
    });
  });
  describe("strings", function () {
    it("removes prefix correctly", function () {
      assert(removePrefix("String", "St") === "ring");
    });
    it("removes suffix correctly", function () {
      assert(removeSuffix("String", "ring") === "St");
    });
    it("replaces all correctly", function () {
      assert(
        replaceAll(
          "'{{ msg }}'. The message is '{{ msg }}'",
          "{{ msg }}",
          "Hello, World!"
        ) === "'Hello, World!'. The message is 'Hello, World!'"
      );
    });
    it("appends zero correctly", function () {
      assert(appendZero(0) === "00");
      assert(appendZero(6) === "06");
      assert(appendZero(21) === "21");
    });
  });
});
