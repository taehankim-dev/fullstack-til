export function cosineSimilarity(a: number[], b: number[]): number {
    const dotProduct = a.reduce((sum, val, idx) => sum + val * b[idx], 0);
    const normA = Math.sqrt(a.reduce((sum, val) => sum + val * val, 0));
    const normB = Math.sqrt(b.reduce((sum, val) => sum + val * val, 0));

    return dotProduct / (normA * normB);
}

export class VectorStore {
    private vectors: { id: string; vector: number[] }[] = [];

    add(id: string, vector: number[]): void {
        this.vectors.push({ id, vector });
    }

    // query와 가장 유사한 벡터 topK개를, 유사도 높은 순으로 반환
    search(query: number[], topK: number): Array<{ id: string; score: number }> {
        const scores: Array<{ id: string, score: number }> = this.vectors.map(({ id, vector }) => {
            return {
                id,
                score: cosineSimilarity(query, vector),
            };
        });

        scores.sort((a, b) => b.score - a.score);

        return scores.slice(0, topK);
    }
}
