import { describe, expect, it } from "vitest";
import { mergeSort } from "./merge-sort";

const numberCompare = (a: number, b: number) => a - b;

describe("mergeSort", () => {
  it("정렬되지 않은 배열을 오름차순으로 정렬한다", () => {
    expect(mergeSort([5, 3, 8, 1, 9, 2], numberCompare)).toEqual([1, 2, 3, 5, 8, 9]);
  });

  it("빈 배열을 그대로 반환한다", () => {
    expect(mergeSort([], numberCompare)).toEqual([]);
  });

  it("원소가 1개인 배열을 그대로 반환한다", () => {
    expect(mergeSort([42], numberCompare)).toEqual([42]);
  });

  it("이미 정렬된 배열도 정상 동작한다", () => {
    expect(mergeSort([1, 2, 3, 4, 5], numberCompare)).toEqual([1, 2, 3, 4, 5]);
  });

  it("역순 배열도 정상 동작한다", () => {
    expect(mergeSort([5, 4, 3, 2, 1], numberCompare)).toEqual([1, 2, 3, 4, 5]);
  });

  it("원본 배열을 변경하지 않는다", () => {
    const original = [3, 1, 2];
    mergeSort(original, numberCompare);
    expect(original).toEqual([3, 1, 2]);
  });

  it("동점(같은 키)일 때 원본 순서를 보존한다 (안정 정렬)", () => {
    type Item = { id: string; key: number };
    const data: Item[] = [
      { id: "a", key: 5 },
      { id: "b", key: 1 },
      { id: "c", key: 5 },
      { id: "d", key: 0 },
    ];

    const result = mergeSort(data, (x, y) => x.key - y.key);

    expect(result.map((item) => item.id)).toEqual(["d", "b", "a", "c"]);
  });
});
