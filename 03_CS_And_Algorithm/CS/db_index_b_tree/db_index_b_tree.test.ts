import { describe, expect, it } from "vitest";
import { BinarySearchTree } from "./db_index_b_tree"

describe("BinarySearchTree", () => {
    it("이진 탐색 트리", () => {
        const bst = new BinarySearchTree((a: number, b: number) => a - b);
        bst.insert(10);
        bst.insert(5);
        bst.insert(15);
        bst.insert(3);
        bst.insert(7);
        bst.insert(12);
        bst.insert(18);

        expect(bst.search(10)).toBe(true);
        expect(bst.search(5)).toBe(true);
        expect(bst.search(15)).toBe(true);
        expect(bst.search(3)).toBe(true);
        expect(bst.search(7)).toBe(true);
        expect(bst.search(12)).toBe(true);
        expect(bst.search(18)).toBe(true);
        expect(bst.search(4)).toBe(false);
    })

    it("동일한 값을 삽입하면 트리는 변하지 않는다", () => {
        const bst = new BinarySearchTree((a: number, b: number) => a - b);
        bst.insert(10);
        bst.insert(10);
        bst.insert(10);

        expect(bst.search(10)).toBe(true);
    })
})