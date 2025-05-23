// src/utils/layout.js
import dagre from 'dagre';

// 노드 크기 (대략) — 필요에 따라 조절하세요
const NODE_WIDTH = 200;
const NODE_HEIGHT = 80;

/**
 * nodes, edges에 dagre 레이아웃을 적용해서 position을 계산해 줍니다.
 * direction: 'LR' (왼→오) or 'TB' (위→아래)
 */
export function applyDagreLayout(nodes, edges, direction = 'LR') {
    // ① Graph 인스턴스를 여기서 새로 만듭니다
    const g = new dagre.graphlib.Graph();
    g.setDefaultEdgeLabel(() => ({}));

    // ② layout 옵션
    g.setGraph({
        rankdir: direction,
        // 같은 레벨 노드를 왼쪽 정렬
        nodesep: 60,    // 노드 간 가로 간격
        ranksep: 80,   // 레벨 간 세로 간격
        marginx: 40,
        marginy: 40,
        ranker: 'longest-path'
    });

    // ③ 노드·엣지 등록
    nodes.forEach((n) => g.setNode(n.id, { width: NODE_WIDTH, height: NODE_HEIGHT }));
    edges.forEach((e) => g.setEdge(e.source, e.target));

    // ④ 레이아웃 계산
    dagre.layout(g);
    const minX = Math.min(...nodes.map(n => g.node(n.id).x));
    // ⑤ 계산된 좌표를 React Flow 형식으로 변환
    const laidOutNodes = nodes.map((n) => {
        const { x, y } = g.node(n.id);
        return {
            ...n,
            data: n.data,
            position: {
                x: x - minX,
                y: y - NODE_HEIGHT / 2
            }
        };
    });

    return { nodes: laidOutNodes, edges };
}
