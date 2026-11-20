import { describe, expect, it } from "vitest";
import { NSWGraph } from "./graph-search";

function buildSampleGraph() {
  const graph = new NSWGraph();
  graph.add("A", [1, 0]);
  graph.add("B", [0.95, 0.31]);
  graph.add("C", [0.5, 0.87]);
  graph.add("D", [0, 1]);
  graph.add("E", [-1, 0]);
  graph.buildGraph(2);
  return graph;
}

describe("NSWGraph.greedySearch", () => {
  it("entry가 멀리 있어도 그래프를 타고 더 유사한 노드로 이동한다", () => {
    const graph = buildSampleGraph();
    const result = graph.greedySearch([0, 1], "A");

    expect(result.id).toBe("D");
    expect(result.score).toBeCloseTo(1);
  });

  it("entry 자체가 이미 가장 유사하면 그대로 반환한다", () => {
    const graph = buildSampleGraph();
    const result = graph.greedySearch([1, 0], "A");

    expect(result.id).toBe("A");
    expect(result.score).toBeCloseTo(1);
  });

  it("다른 entry에서 시작해도 같은 결과(근사 최근접)에 도달한다", () => {
    const graph = buildSampleGraph();
    const result = graph.greedySearch([0, 1], "E");

    expect(result.id).toBe("D");
    expect(result.score).toBeCloseTo(1);
  });
});
