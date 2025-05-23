// src/DiagramPage.jsx
import React, { useState, useCallback, useMemo, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import ReactFlow, {
    ReactFlowProvider,
    MiniMap,
    Controls,
    Background,
    useNodesState,
    useEdgesState,
    applyNodeChanges,
    applyEdgeChanges,
    addEdge,
    Handle,
    Position,
} from 'reactflow'
import 'reactflow/dist/style.css'
import { applyDagreLayout } from './utils/layout'
import { FiPlus } from 'react-icons/fi'
import { updateDiagram } from './api'


/** 커스텀 노드들 */
function TaskNode({ id, data, isSelected }) {
    const [hovered, setHovered] = useState(false)
    const statusColor =
        data.status === 'complete'
            ? '#d1f5d3'
            : data.status === 'in-progress'
                ? '#fdd'
                : '#fff'
    const statusLabel =
        data.status === 'complete'
            ? '✅ 완료'
            : data.status === 'in-progress'
                ? '🔄 진행중'
                : ''

    return (
        <div
            style={{
                position: 'relative',
                padding: 10,
                border: isSelected ? '2px solid #007acc' : '1px solid #333',
                borderRadius: 4,
                background: statusColor,
                minWidth: 160,
                boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
                fontFamily: "'Inter', sans-serif",
                display: 'grid',
                gridTemplateRows: 'auto 1fr',
                lineHeight: 1.4,
                cursor: 'pointer'
            }}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            onClick={e => {
                e.stopPropagation()
                data.onSelect(id)
            }}
        >
            <strong>{data.role}</strong>
            <div>{data.task}</div>
            <small style={{ color: '#555' }}>모델명: {data.model || '없음'}</small>
            {statusLabel && <div style={{ fontSize: 12, marginTop: 4 }}>{statusLabel}</div>}
            {data.comment && (
                <div
                    style={{
                        marginTop: 6,
                        fontSize: 11,
                        color: '#444',
                        background: '#fef3c7',
                        padding: '4px 6px',
                        borderRadius: 4,
                        border: '1px solid #fcd34d'
                    }}
                >
                    💬 {data.comment.length > 30 ? data.comment.slice(0, 30) + '...' : data.comment}
                </div>
            )}
            <Handle type="target" position={Position.Left} style={{ background: '#333' }} />
            <Handle type="source" position={Position.Right} style={{ background: '#333' }} />

            {hovered && (
                <div
                    style={{
                        position: 'absolute',
                        top: 4,
                        right: 4,
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 4,
                        background: 'rgba(255,255,255,0.9)',
                        padding: '4px 6px',
                        borderRadius: 4,
                        boxShadow: '0 1px 4px rgba(0,0,0,0.15)'
                    }}
                >
                    <button
                        style={{ fontSize: 10 }}
                        onClick={e => {
                            e.stopPropagation()
                            const newRole = prompt('역할을 수정하세요', data.role)
                            const newTask = prompt('업무명을 수정하세요', data.task)
                            const newModel = prompt('모델명을 수정하세요', data.model)
                            if (newRole !== null || newTask !== null || newModel !== null) {
                                data.onEdit(id, {
                                    role: newRole !== null ? newRole : data.role,
                                    task: newTask !== null ? newTask : data.task,
                                    model: newModel !== null ? newModel : data.model
                                })
                            }
                        }}
                    >
                        수정
                    </button>
                    <button
                        style={{ fontSize: 10 }}
                        onClick={e => {
                            e.stopPropagation()
                            if (confirm('삭제할까요?')) data.onDelete(id)
                        }}
                    >
                        삭제
                    </button>
                    <button
                        style={{ fontSize: 10 }}
                        onClick={e => {
                            e.stopPropagation()
                            data.onEdit(id, { status: 'in-progress' })
                        }}
                    >
                        진행중
                    </button>
                    <button
                        style={{ fontSize: 10 }}
                        onClick={e => {
                            e.stopPropagation()
                            data.onEdit(id, { status: 'complete' })
                        }}
                    >
                        완료
                    </button>
                </div>
            )}
        </div>
    )
}

function SectionGroup({ data, children }) {
    return (
        <div
            style={{
                padding: 8,
                border: '2px dashed #666',
                borderRadius: 6,
                position: 'relative',
                background: '#fafafa'
            }}
        >
            <div
                style={{
                    position: 'absolute',
                    top: -12,
                    left: 12,
                    background: '#fafafa',
                    padding: '0 4px',
                    fontWeight: 'bold'
                }}
            >
                {data.label}
            </div>
            {children}
        </div>
    )
}

export default function DiagramPage() {
    const navigate = useNavigate()
    const { id } = useParams()

    // 1) 원본 스펙 + 파라미터
    const [spec, setSpec] = useState(null)
    const [params, setParams] = useState(null)

    // 2) React‑Flow 상태
    const [nodes, setNodes] = useState([])
    const [edges, setEdges] = useState([])
    const [selectedId, setSelectedId] = useState(null)
    const [rfInstance, setRfInstance] = useState(null)

    const saveSpec = async (newSpec) => {
        await fetch(`/api/diagrams/${id}/`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ spec: newSpec }),
        })
    }
    const onNodesChangeHandler = useCallback((changes) => {
        setNodes(nds => {
            const updated = applyNodeChanges(changes, nds)
            // 변경된 nodes + 현재 edges 로 스펙 빌드 후 저장
            saveSpec({
                nodeDataArray: updated.map(n => ({
                    id: n.id,
                    parentId: n.data.parentId ?? null,
                    type: n.type,
                    data: {
                        role: n.data.role,
                        task: n.data.task,
                        model: n.data.model,
                        status: n.data.status,
                        comment: n.data.comment
                    },
                    position: n.position
                })),
                linkDataArray: edges.map(e => ({
                    id: e.id,
                    source: e.source,
                    target: e.target,
                    label: e.label || ''
                }))
            })
            return updated
        })
    }, [edges])

    const onEdgesChangeHandler = useCallback((changes) => {
        setEdges(eds => {
            const updated = applyEdgeChanges(changes, eds)
            // 현재 nodes + 변경된 edges 로 스펙 빌드 후 저장
            saveSpec({
                nodeDataArray: nodes.map(n => ({
                    id: n.id,
                    parentId: n.data.parentId ?? null,
                    type: n.type,
                    data: {
                        role: n.data.role,
                        task: n.data.task,
                        model: n.data.model,
                        status: n.data.status,
                        comment: n.data.comment
                    },
                    position: n.position
                })),
                linkDataArray: updated.map(e => ({
                    id: e.id,
                    source: e.source,
                    target: e.target,
                    label: e.label || ''
                }))
            })
            return updated
        })
    }, [nodes])

    // 노드 클릭/수정/삭제 콜백을 주입
    const makeData = useCallback(
        (data, nodeId) => ({
            ...data,
            comment: data.comment || '',
            onSelect: () => setSelectedId(nodeId),
            onEdit: (id, newData) => {
                setNodes(nds => {
                    const updated = nds.map(n =>
                        n.id === id
                            ? { ...n, data: { ...n.data, ...newData, onSelect: n.data.onSelect, onEdit: n.data.onEdit } }
                            : n
                    )
                    // 변경된 노드·엣지를 모아 새로운 spec 생성
                    const newSpec = {
                        nodeDataArray: updated.map(n => ({
                            id: n.id,
                            parentId: n.data.parentId ?? null,
                            type: n.type,
                            data: {
                                role: n.data.role,
                                task: n.data.task,
                                model: n.data.model,
                                status: n.data.status,
                                comment: n.data.comment
                            },
                            position: n.position,
                        })),
                        linkDataArray: edges.map(e => ({
                            id: e.id,
                            source: e.source,
                            target: e.target,
                            label: e.label || ''
                        }))
                    }
                    // 서버에 저장
                    saveSpec(newSpec)
                    return updated
                })
            },
            onDelete: (id) => {
                setNodes(nds => {
                    const filtered = nds.filter(n => n.id !== id)
                    // 삭제 후 엣지도 필터링
                    const filteredEdges = edges.filter(e => e.source !== id && e.target !== id)

                    // 저장할 spec 생성
                    const newSpec = {
                        nodeDataArray: filtered.map(n => ({
                            id: n.id,
                            parentId: n.data.parentId ?? null,
                            type: n.type,
                            data: {
                                role: n.data.role,
                                task: n.data.task,
                                model: n.data.model,
                                status: n.data.status,
                                comment: n.data.comment
                            },
                            position: n.position
                        })),
                        linkDataArray: filteredEdges.map(e => ({
                            id: e.id,
                            source: e.source,
                            target: e.target,
                            label: e.label || ''
                        }))
                    }
                    saveSpec(newSpec)
                    return filtered
                })
                setEdges(eds => eds.filter(e => e.source !== id && e.target !== id))
                setSelectedId(null)
            }
        }),
        [setNodes, setEdges, edges]
    )

    // 3) 서버에서 스펙 가져오고 레이아웃 적용
    useEffect(() => {
        if (!id) return
            ; (async () => {
                try {
                    const res = await fetch(`/api/diagrams/${id}/`)
                    if (!res.ok) throw new Error(res.status)
                    const json = await res.json()

                    setSpec(json.spec)
                    setParams({
                        keyword: json.keyword,
                        lang: json.lang,
                        startDate: json.start_date,
                        endDate: json.end_date
                    })

                    const { nodes: laid, edges: laidEdges } = applyDagreLayout(
                        json.spec.nodeDataArray,
                        json.spec.linkDataArray,
                        'LR'
                    )

                    setNodes(
                        laid.map(n => ({
                            ...n,
                            type: n.type,
                            data: makeData(n.data, n.id)
                        }))
                    )
                    setEdges(laidEdges)
                } catch (err) {
                    console.error(err)
                    navigate('/')
                }
            })()
    }, [id, navigate])

    // 4) React‑Flow 인스턴트 획득 → fitView
    const onFlowInit = useCallback((instance) => {
        setRfInstance(instance)
        setTimeout(() => instance.fitView({ padding: 0.1 }), 50)
    }, [])

    // 5) 새 노드 추가
    const handleAddNode = useCallback(() => {
        if (!rfInstance) return
        const center = rfInstance.project({
            x: window.innerWidth / 2,
            y: window.innerHeight / 2
        })
        const nodeId = Date.now().toString()
        const role = prompt('역할을 입력하세요')
        if (!role) return
        const task = prompt('업무명을 입력하세요')
        if (!task) return
        const model = prompt('모델명을 입력하세요') || ''

        setNodes(oldNodes => {
            const newNode = {
                id: nodeId,
                type: 'task',
                position: center,
                data: makeData({ role, task, model, status: '', comment: '' }, nodeId)
            }
            const updated = [...oldNodes, newNode]

            // 자동 저장
            const newSpec = {
                nodeDataArray: updated.map(n => ({
                    id: n.id,
                    parentId: n.data.parentId ?? null,
                    type: n.type,
                    data: {
                        role: n.data.role,
                        task: n.data.task,
                        model: n.data.model,
                        status: n.data.status,
                        comment: n.data.comment
                    },
                    position: n.position
                })),
                linkDataArray: edges.map(e => ({
                    id: e.id,
                    source: e.source,
                    target: e.target,
                    label: e.label || ''
                }))
            }
            saveSpec(newSpec)
            return updated
        })
    }, [rfInstance, makeData, edges, saveSpec])

    const nodeTypes = useMemo(() => ({ task: TaskNode, group: SectionGroup }), [])

    if (!spec) {
        return (
            <div style={{ padding: 20 }}>
                <p>다이어그램 정보를 불러오는 중입니다…</p>
                <button onClick={() => navigate('/')}>← 돌아가기</button>
            </div>
        )
    }

    const selectedNode = nodes.find(n => n.id === selectedId)

    return (
        <div
            style={{
                display: 'grid',
                gridTemplateRows: 'auto 1fr',
                gridTemplateColumns: '1fr 300px',
                width: '100vw',
                height: '100vh',
                overflow: 'hidden'
            }}
        >
            <header
                style={{
                    gridColumn: '1/-1',
                    padding: '12px 16px',
                    background: '#f0f0f0',
                    borderBottom: '1px solid #ddd',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8
                }}
            >
                <button onClick={() => navigate('/')}>← 돌아가기</button>
                <button
                    onClick={() => {
                        navigator.clipboard.writeText(window.location.href)
                        alert('링크가 복사되었습니다!')
                    }}
                >
                    🔗 링크 복사
                </button>
                <div style={{ marginLeft: 'auto', fontSize: 14 }}>
                    키워드: {params.keyword} | {params.startDate} ~ {params.endDate}
                </div>
            </header>

            <div style={{ gridRow: 2, gridColumn: 1, position: 'relative' }}>
                <ReactFlowProvider>
                    <ReactFlow
                        nodes={nodes}
                        edges={edges}
                        onInit={onFlowInit}
                        onNodesChange={onNodesChangeHandler}
                        onEdgesChange={onEdgesChangeHandler}
                        onConnect={c => {
                            setEdges(es => {
                                const nextEdges = addEdge(c, es)
                                // 변경된 edges 로 스펙 재생성해서 저장
                                const newSpec = {
                                    nodeDataArray: nodes.map(n => ({
                                        id: n.id,
                                        parentId: n.data.parentId ?? null,
                                        type: n.type,
                                        data: {
                                            role: n.data.role,
                                            task: n.data.task,
                                            model: n.data.model,
                                            status: n.data.status,
                                            comment: n.data.comment
                                        },
                                        position: n.position
                                    })),
                                    linkDataArray: nextEdges.map(e => ({
                                        id: e.id,
                                        source: e.source,
                                        target: e.target,
                                        label: e.label || ''
                                    }))
                                }
                                saveSpec(newSpec)
                                return nextEdges
                            })
                        }}
                        nodeTypes={nodeTypes}
                        nodesDraggable
                        nodesConnectable
                        zoomOnDoubleClick={false}
                        fitView
                        defaultEdgeOptions={{ type: 'step' }}
                        style={{ width: '100%', height: '100%' }}
                    >
                        <MiniMap />
                        <Controls />
                        <Background />
                    </ReactFlow>
                </ReactFlowProvider>

                <button
                    onClick={handleAddNode}
                    style={{
                        position: 'absolute',
                        bottom: 40,
                        left: 10,
                        padding: '6px 12px',
                        background: '#1f2937',
                        color: '#fff',
                        border: 'none',
                        borderRadius: 4,
                        cursor: 'pointer'
                    }}
                >
                    <FiPlus /> 노드추가
                </button>
            </div>

            <aside
                style={{
                    gridRow: 2,
                    gridColumn: 2,
                    padding: 16,
                    borderLeft: '1px solid #ddd',
                    overflowY: 'auto'
                }}
            >
                <h3>세부 정보</h3>
                <p>기간: {params.startDate} ~ {params.endDate}</p>
                <p>노드 수: {nodes.length}</p>
                <p>엣지 수: {edges.length}</p>

                {selectedNode && (
                    <div style={{ marginTop: 24 }}>
                        <h4>코멘트</h4>
                        <p>{selectedNode.data.comment || '없음'}</p>
                        <button
                            onClick={() => {
                                const comment = prompt(
                                    '코멘트를 입력하세요',
                                    selectedNode.data.comment || ''
                                )
                                if (comment !== null) {
                                    selectedNode.data.onEdit(selectedId, { comment })
                                }
                            }}
                        >
                            코멘트 입력
                        </button>
                    </div>
                )}
            </aside>
        </div>
    )
}

