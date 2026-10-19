interface BSTNode<T> {
    value: T;
    left: BSTNode<T> | null;
    right: BSTNode<T> | null;
}

export class BinarySearchTree<T> {
    constructor(private compare: (a: T, b: T) => number) { }

    private root: BSTNode<T> | null = null;

    // value를 트리에 삽입 (정렬 순서 유지)
    insert(value: T): void {
        if (!this.root) {
            this.root = { value, left: null, right: null };
            return;
        }

        let current = this.root;
        while (current) {
            let cmp = this.compare(value, current.value);
            if (cmp < 0) {
                if (!current.left) {
                    current.left = { value, left: null, right: null };
                    return;
                }
                current = current.left;
            } else if (cmp > 0) {
                if (!current.right) {
                    current.right = { value, left: null, right: null };
                    return;
                }
                current = current.right;
            } else {
                // 같은 값은 무시
                return;
            }
        }


    }

    // value가 트리에 있는지 탐색
    search(value: T): boolean {
        let current = this.root;

        while (current) {
            let cmp = this.compare(value, current.value);

            if (cmp === 0) return true;
            else if (cmp < 0) current = current.left;
            else current = current.right;
        }

        return false;
    }
}