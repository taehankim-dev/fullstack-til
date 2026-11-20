import { describe, expect, it } from "vitest";
import { cosineSimilarity, VectorStore } from "./vector-search";

describe("cosineSimilarity", () => {
  it("같은 방향의 벡터는 유사도 1", () => {
    expect(cosineSimilarity([1, 0], [1, 0])).toBeCloseTo(1);
  });

  it("직각인 벡터는 유사도 0", () => {
    expect(cosineSimilarity([1, 0], [0, 1])).toBeCloseTo(0);
  });

  it("반대 방향 벡터는 유사도 -1", () => {
    expect(cosineSimilarity([1, 0], [-1, 0])).toBeCloseTo(-1);
  });

  it("크기(길이)가 달라도 방향만 같으면 유사도 1", () => {
    expect(cosineSimilarity([1, 0], [5, 0])).toBeCloseTo(1);
  });
});

describe("VectorStore", () => {
  it("query와 유사도가 높은 순으로 topK개를 반환한다", () => {
    const store = new VectorStore();
    store.add("a", [1, 0]);
    store.add("b", [0.9, 0.1]);
    store.add("c", [0, 1]);

    const result = store.search([1, 0], 2);

    expect(result).toHaveLength(2);
    expect(result[0].id).toBe("a");
    expect(result[0].score).toBeCloseTo(1);
    expect(result[1].id).toBe("b");
  });

  it("topK가 저장된 개수보다 크면 저장된 개수만큼만 반환한다", () => {
    const store = new VectorStore();
    store.add("a", [1, 0]);

    const result = store.search([1, 0], 5);
    expect(result).toHaveLength(1);
  });
});
