interface GraphNode {
    id: string;
    vector: number[];
    neighbors: string[];
}

function cosineSimilarity(a: number[], b: number[]): number {
    const dot = a.reduce((sum, v, i) => sum + v * b[i], 0);
    const normA = Math.sqrt(a.reduce((sum, v) => sum + v * v, 0));
    const normB = Math.sqrt(b.reduce((sum, v) => sum + v * v, 0));
    return dot / (normA * normB);
}

export class NSWGraph {
    private nodes = new Map<string, GraphNode>();

    add(id: string, vector: number[]): void {
        this.nodes.set(id, { id, vector, neighbors: [] });
    }

    // 각 노드를 자기 자신을 제외한 다른 노드 중 가장 유사한 상위 k개와 서로 연결(무방향)
    buildGraph(k: number): void {
        const ids = [...this.nodes.keys()];

        for (const id of ids) {
            const node = this.nodes.get(id)!;
            const topK = ids
                .filter((otherId) => otherId !== id)
                .map((otherId) => ({
                    otherId,
                    score: cosineSimilarity(node.vector, this.nodes.get(otherId)!.vector),
                }))
                .sort((a, b) => b.score - a.score)
                .slice(0, k);

            for (const { otherId } of topK) {
                if (!node.neighbors.includes(otherId)) node.neighbors.push(otherId);
                const other = this.nodes.get(otherId)!;
                if (!other.neighbors.includes(id)) other.neighbors.push(id);
            }
        }
    }

    getNeighbors(id: string): string[] {
        return this.nodes.get(id)?.neighbors ?? [];
    }

    // entryId에서 시작해서, 현재 노드보다 query와 더 유사한 이웃이 있으면 그쪽으로 이동.
    // 더 유사한 이웃이 없으면 멈추고, 그 시점의 노드를 "근사 최근접"으로 반환.
    greedySearch(query: number[], entryId: string): { id: string; score: number } {
        let current = entryId;
        let currentScore = cosineSimilarity(this.nodes.get(current)!.vector, query);

        while (true) {
            const neighborIds = this.nodes.get(current)!.neighbors;

            let bestNeighborId: string | null = null;
            let bestNeighborScore = -Infinity;

            for (const neighborId of neighborIds) {
                const score = cosineSimilarity(this.nodes.get(neighborId)!.vector, query);

                if (score > bestNeighborScore) {
                    bestNeighborId = neighborId;
                    bestNeighborScore = score;
                }
            }

            if (bestNeighborScore > currentScore) {
                current = bestNeighborId!
                currentScore = bestNeighborScore;
            } else {
                break;
            }
        }

        return { id: current, score: currentScore };
    }
}
