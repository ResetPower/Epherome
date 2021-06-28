import assert from "assert";
import os from "os";
import { isCompliant } from "../src/core/rules";

describe("core", function () {
  describe("rules", function () {
    describe("#isCompliant", function () {
      it("returns true if arg is empty", function () {
        assert(isCompliant([]));
      });
      it("deals when length of arg is 1", function () {
        assert(isCompliant([{ action: "allow" }]));
        assert(!isCompliant([{ action: "disallow" }]));
      });
      it("deals when length of arg is 2", function () {
        assert(
          isCompliant([{ action: "disallow" }, { action: "allow", os: { name: os.platform() } }])
        );
        assert(
          !isCompliant([{ action: "allow" }, { action: "disallow", os: { name: os.platform() } }])
        );
      });
    });
  });
});
