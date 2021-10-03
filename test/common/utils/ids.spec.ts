import assert from "assert";
import { shortid } from "../../../src/common/utils/ids";

describe("common/utils/ids", function () {
  describe("#shortid", function () {
    it("returns correct id", function () {
      assert(shortid() === 0);
      assert(shortid() === 1);
      assert(shortid() === 2);
      assert(shortid() === 3);
      assert(shortid() === 4);
      assert(shortid() === 5);
    });
  });
});
