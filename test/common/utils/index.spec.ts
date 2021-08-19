import assert, { equal } from "assert";
import {
  Accessible,
  obj2form,
  unwrapAccessible,
  normalizeArray,
  adapt,
  call,
} from "../../../src/common/utils";

describe("common/utils", function () {
  describe("#obj2form", function () {
    it("transfers obj to form", function () {
      const obj = {
        a: "a",
        b: "b",
      };
      equal(obj2form(obj), "a=a&b=b");
    });
  });
  describe("#unwrapAccessible", function () {
    it("unwraps accessible object", function () {
      const accessible: Accessible<string> = "Hello, World!";
      equal(unwrapAccessible(accessible), "Hello, World!");
    });
    it("unwraps accessible function without params", function () {
      const accessible: Accessible<string> = () => "Hello, World!";
      equal(unwrapAccessible(accessible), "Hello, World!");
    });
    it("unwraps accessible function with single param", function () {
      const accessible: Accessible<string, [string[]]> = (arr: string[]) =>
        `The first item of the array is ${arr[0]}`;
      equal(
        unwrapAccessible(accessible, ["Hello, World!"]),
        "The first item of the array is Hello, World!"
      );
    });
    it("unwraps accessible function with multiple params", function () {
      const accessible: Accessible<string, [string, number]> = (
        str: string,
        num: number
      ) => `String is ${str} while number is ${num}`;
      equal(
        unwrapAccessible(accessible, "Mocha", 1),
        "String is Mocha while number is 1"
      );
    });
  });
  describe("#normalizeArray", function () {
    it("return the arg if it is an array", function () {
      const arr = [1, 2, 3];
      equal(normalizeArray(arr), arr);
    });
    it("return wrapped arg if it is not an array", function () {
      const former = { a: "a", b: "b" };
      const normalized = normalizeArray(former);
      assert(normalized[0] === former);
    });
  });
  describe("#call", function () {
    it("ignores undefined function", function () {
      call(undefined);
    });
    it("invoke defined function without params", function () {
      call(() => "Hello,World!");
    });
    it("invoke defined function with multiple params", function () {
      const returned = call((a: number, b: number) => a + b, 1, 2);
      equal(returned, 3);
    });
  });
  describe("#adapt", function () {
    it("return false when no one matched", function () {
      assert(!adapt(1, 2, 3, 4, 5, 6));
    });
    it("return true when one item matched", function () {
      assert(adapt(1, 2, 3, 1, 4, 5, 6));
    });
    it("return true when all matched", function () {
      assert(adapt(1, 1, 1, 1, 1, 1, 1));
    });
  });
});
