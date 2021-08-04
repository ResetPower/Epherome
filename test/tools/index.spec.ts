import { equal, ok } from "assert";
import {
  Accessible,
  obj2form,
  unwrapAccessible,
  unwrapFunction,
} from "../../src/tools";

describe("tools", function () {
  describe("#unwrapFunction", function () {
    it("unwraps undefined function", function () {
      const result0 = unwrapFunction(undefined);
      ok(result0);
    });
    it("unwraps defined function", function () {
      const func = () => {
        /**/
      };
      const result1 = unwrapFunction(func);
      equal(result1, func);
    });
  });
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
});
