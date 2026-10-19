export class HashTable<V> {
    private buckets: Array<Array<[string, V]>>;

    constructor(private bucketCount: number = 8) {
        this.buckets = Array.from({ length: bucketCount }, () => []);
    }

    private hash(key: string): number {
        let hash = 0;
        for (let i = 0; i < key.length; i++) {
            hash = (hash * 31 + key.charCodeAt(i)) % this.bucketCount;
        }
        return hash;
    }

    // key-value를 저장. 같은 key로 또 set하면 "추가"가 아니라 "값 갱신"이어야 함
    set(key: string, value: V): void {
        const index = this.hash(key);
        const bucket = this.buckets[index];

        for (let i = 0; i < bucket.length; i++) {
            const [currentKey, currentValue] = bucket[i];
            if (currentKey === key) {
                bucket[i] = [key, value];
                return;
            }
        }

        bucket.push([key, value]);
    }

    // key에 해당하는 value를 반환. 없으면 undefined
    get(key: string): V | undefined {
        const index = this.hash(key);
        const bucket = this.buckets[index];

        for (let i = 0; i < bucket.length; i++) {
            const [currentKey, currentValue] = bucket[i];
            if (currentKey === key) {
                return currentValue;
            }
        }

        return undefined;
    }

    // key를 제거. 제거했으면 true, 원래 없었으면 false
    delete(key: string): boolean {
        const index = this.hash(key);
        const bucket = this.buckets[index];

        for (let i = 0; i < bucket.length; i++) {
            const [currentKey, currentValue] = bucket[i];
            if (currentKey === key) {
                bucket.splice(i, 1);
                return true;
            }
        }

        return false;
    }
}
