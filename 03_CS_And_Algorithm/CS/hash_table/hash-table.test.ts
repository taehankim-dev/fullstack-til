import { describe, expect, it } from "vitest";
import { HashTable } from "./hash-table";

describe("HashTable", () => {
  it("set한 값을 get으로 조회할 수 있다", () => {
    const table = new HashTable<number>();
    table.set("a", 1);
    expect(table.get("a")).toBe(1);
  });

  it("존재하지 않는 key를 get하면 undefined를 반환한다", () => {
    const table = new HashTable<number>();
    expect(table.get("nope")).toBeUndefined();
  });

  it("같은 key로 set하면 추가되지 않고 값만 갱신된다", () => {
    const table = new HashTable<number>();
    table.set("a", 1);
    table.set("a", 2);
    expect(table.get("a")).toBe(2);
  });

  it("같은 버킷에 여러 키가 충돌해도 각각 올바르게 조회된다", () => {
    const table = new HashTable<number>(1); // 버킷 1개 = 모든 키가 강제로 충돌
    table.set("a", 1);
    table.set("b", 2);
    table.set("c", 3);

    expect(table.get("a")).toBe(1);
    expect(table.get("b")).toBe(2);
    expect(table.get("c")).toBe(3);
  });

  it("존재하는 key를 delete하면 true를 반환하고 제거된다", () => {
    const table = new HashTable<number>();
    table.set("a", 1);

    expect(table.delete("a")).toBe(true);
    expect(table.get("a")).toBeUndefined();
  });

  it("존재하지 않는 key를 delete하면 false를 반환한다", () => {
    const table = new HashTable<number>();
    expect(table.delete("nope")).toBe(false);
  });

  it("충돌이 있는 버킷에서 특정 key만 delete해도 나머지는 그대로 남아있다", () => {
    const table = new HashTable<number>(1);
    table.set("a", 1);
    table.set("b", 2);

    expect(table.delete("a")).toBe(true);
    expect(table.get("a")).toBeUndefined();
    expect(table.get("b")).toBe(2);
  });
});
