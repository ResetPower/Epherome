import assert from "assert";
import { getById, getNextId, WithId } from "../src/tools/arrays";
import { obj2form, unwrapFunction } from "../src/tools/objects";
import { appendZero, removePrefix, removeSuffix, replaceAll } from "../src/tools/strings";

interface MyStructWithId extends WithId {
  name: string;
}

const arr: MyStructWithId[] = [
  { id: 2, name: "a" },
  { id: 3, name: "b" },
];

describe("tools", function () {
  describe("arrays", function () {
    it("getById", function () {
      assert(getById(arr, 2)?.name === "a");
      assert(getById(arr, 3)?.name === "b");
    });
    it("getNextId", function () {
      assert(getNextId(arr) === 4);
    });
  });
  describe("objects", function () {
    it("unwrapFunction", function () {
      const result0 = unwrapFunction(undefined);
      assert(result0);
      const func = function () {
        /**/
      };
      const result1 = unwrapFunction(func);
      assert(result1 === func);
    });
    it("obj2form", function () {
      const obj = {
        a: "a",
        b: "b",
      };
      assert(obj2form(obj) === "a=a&b=b");
    });
  });
  describe("strings", function () {
    it("removePrefix", function () {
      assert(removePrefix("String", "St") === "ring");
    });
    it("removeSuffix", function () {
      assert(removeSuffix("String", "ring") === "St");
    });
    it("replaceAll", function () {
      assert(
        replaceAll("'{{ msg }}'. The message is '{{ msg }}'", "{{ msg }}", "Hello, World!") ===
          "'Hello, World!'. The message is 'Hello, World!'"
      );
    });
    it("appendZero", function () {
      assert(appendZero(0) === "00");
      assert(appendZero(6) === "06");
      assert(appendZero(21) === "21");
    });
  });
});
