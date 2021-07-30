import assert from "assert";
import { obj2form, unwrapFunction, appendZero } from "../src/tools";

describe("tools", function () {
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
    it("appends zero correctly", function () {
      assert(appendZero(0) === "00");
      assert(appendZero(6) === "06");
      assert(appendZero(21) === "21");
    });
  });
});
