import { WithUnderline, _ } from "../../../src/common/utils/arrays";
import { equal } from "assert";

interface MyWithUnderline extends WithUnderline {
  a: string;
  b: string;
}

describe("common/utils/arrays", function () {
  const arr: MyWithUnderline[] = [
    { a: "0", b: "0" },
    { a: "1", b: "1" },
    { a: "2", b: "2" },
  ];
  const myWithUnderline: MyWithUnderline = { a: "3", b: "3" };
  describe("#append", function () {
    it("appends an item", function () {
      _.append(arr, myWithUnderline, true);
      equal(arr.length, 4);
    });
  });
  describe("#remove", function () {
    it("removes an item", function () {
      _.remove(arr, myWithUnderline);
      equal(arr.length, 3);
    });
  });
  describe("#select", function () {
    it("selects an item", function () {
      const item = arr[1];
      _.select(arr, item);
      equal(_.selected(arr), item);
    });
  });
  describe("#deselect", function () {
    it("deselects selected item", function () {
      _.deselect(arr);
      equal(_.selected(arr), undefined);
    });
  });
});
