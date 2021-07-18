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
      it("deals with 'features' key", function () {
        assert(
          isCompliant([{ action: "allow", features: { is_demo_user: true } }], {
            is_demo_user: true,
            has_custom_resolution: true,
          })
        );
        assert(
          isCompliant([{ action: "allow", features: { has_custom_resolution: true } }], {
            is_demo_user: false,
            has_custom_resolution: true,
          })
        );
        assert(!isCompliant([{ action: "allow", features: { is_demo_user: true } }], {}));
        assert(
          !isCompliant([{ action: "disallow", features: { is_demo_user: true } }], {
            is_demo_user: true,
            has_custom_resolution: true,
          })
        );
      });
    });
  });
});
