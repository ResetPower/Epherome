import assert from "assert";
import { shortid } from "../../../src/common/utils/ids";

describe("common/utils/ids", function () {
  describe("#shortid", function () {
    it("returns correct id", function () {
      assert(shortid().startsWith("0"));
      assert(shortid().startsWith("1"));
      assert(shortid().startsWith("2"));
      assert(shortid().startsWith("3"));
      assert(shortid().startsWith("4"));
      assert(shortid().startsWith("5"));
    });
  });
});
