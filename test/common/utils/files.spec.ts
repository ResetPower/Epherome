import { equal } from "assert";
import { basenameWithoutExt } from "../../../src/common/utils/files";

describe("common/utils/files", function () {
  describe("#basenameWithoutExt", function () {
    it("succeed with complex path", function () {
      equal(
        basenameWithoutExt(
          "/Users/HelloWorld/Complex/path/to/difficult_to_understand.tt"
        ),
        "difficult_to_understand"
      );
    });
    it("succeed with simple path", function () {
      equal(basenameWithoutExt("test.litemod"), "test");
      equal(basenameWithoutExt("wow.jar"), "wow");
      equal(basenameWithoutExt("main.ts"), "main");
      equal(basenameWithoutExt("hello.c"), "hello");
    });
  });
});
