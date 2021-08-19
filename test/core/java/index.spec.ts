import { equal } from "assert";
import { parseJvmArgs } from "../../../src/core/java";

describe("core/java", function () {
  describe("#parseJvmArgs", function () {
    it("parses args without quotes", function () {
      equal(
        parseJvmArgs("-XstartOnFirstThread -Xmx4G").toString(),
        ["-XstartOnFirstThread", "-Xmx4G"].toString()
      );
    });
    it("parses args with quotes", function () {
      equal(
        parseJvmArgs(
          '-Xmx4G "-Depherome.dir=/Users/HelloWorld/Library/Application Support/epherome"'
        ).toString(),
        [
          "-Xmx4G",
          "-Depherome.dir=/Users/HelloWorld/Library/Application Support/epherome",
        ].toString()
      );
    });
  });
});
