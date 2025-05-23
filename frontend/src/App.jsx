// src/App.jsx
import React, { useCallback, useState } from 'react'
import ReactFlow, {
  ReactFlowProvider,
  useNodesState,
  useEdgesState,
  addEdge,
  MiniMap,
  Controls,
  Background
} from 'reactflow'
import { useNavigate } from 'react-router-dom'
import { fetchDiagram } from './api'
import 'reactflow/dist/style.css'
import { TaskNode, SectionGroup } from './CustomNodes.jsx'
import { applyDagreLayout } from './utils/layout'
import './App.css'

const nodeTypes = { task: TaskNode, group: SectionGroup }

export default function App() {
  const [nodes, setNodes, onNodesChange] = useNodesState([])
  const [edges, setEdges, onEdgesChange] = useEdgesState([])
  const [loading, setLoading] = useState(false)
  const [params, setParams] = useState({
    keyword: '',
    lang: 'ko',
    startDate: '',
    endDate: ''
  })

  const navigate = useNavigate()

  const handleGenerate = async () => {
    const { keyword, lang, startDate, endDate } = params
    if (!keyword || !startDate || !endDate) {
      return alert(lang === 'ko'
        ? '모든 필드를 입력해주세요.'
        : 'Please fill out all fields.')
    }

    setLoading(true)
    try {
      // 1) JSON 스펙 불러오기
      const spec = await fetchDiagram({
        keyword,
        lang,
        start_date: startDate,
        end_date: endDate
      })

      // 2) React Flow 에 세팅
      const rfNodes = spec.nodeDataArray.map((n) => ({
        id: n.id,
        type: n.type,
        data: {
          role: n.data.role,
          task: n.data.task,
          model: n.data.model
        },
        position: { x: 0, y: 0 },
        __rf: { width: 200, height: 80 }
      }))
      const rfEdges = spec.linkDataArray.map((e) => ({
        id: e.id,
        source: e.source,
        target: e.target,
        label: e.label || ''
      }))

      const { nodes: laid, edges: laidEdges } =
        applyDagreLayout(rfNodes, rfEdges, 'LR')

      setNodes(laid)
      setEdges(laidEdges)
      const saveResp = await fetch('/api/diagrams/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ keyword, lang, start_date: startDate, end_date: endDate, spec })
      })

      const saveText = await saveResp.text()
      console.log('POST /api/diagrams/ →', saveResp.status, saveText)

      if (!saveResp.ok) {
        alert(`저장에 실패했습니다: ${saveResp.status}\n${saveText}`)
        return
      }

      const saved = JSON.parse(saveText)

      // 🔽 저장한 다이어그램 id로 이동
      navigate(`/diagram/${saved.id}`)
    } catch (err) {
      console.error(err)
      alert(lang === 'ko'
        ? '차트 생성에 실패했습니다.'
        : 'Failed to generate chart.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      height: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'column'
    }}>
      <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 'bold' }}>Project Progress Map</h1>
        <p style={{ fontSize: '0.875rem', color: '#555' }}>developed by Hanna Lee</p>
      </div>

      <div style={{ display: 'flex', gap: '0.5rem' }}>
        <input
          type="date"
          value={params.startDate}
          onChange={e => setParams(p => ({ ...p, startDate: e.target.value }))}
        />
        <input
          type="date"
          value={params.endDate}
          onChange={e => setParams(p => ({ ...p, endDate: e.target.value }))}
        />
        <input
          type="text"
          placeholder={params.lang === 'ko' ? '프로젝트 키워드' : 'Project keyword'}
          value={params.keyword}
          onChange={e => setParams(p => ({ ...p, keyword: e.target.value }))}
        />
        <button
          onClick={handleGenerate}
          disabled={loading}
          style={{
            background: '#3b82f6',
            color: 'white',
            padding: '0 1rem',
            borderRadius: '0.25rem',
            opacity: loading ? 0.5 : 1
          }}
        >
          {loading
            ? (params.lang === 'ko' ? '생성 중…' : 'Generating…')
            : (params.lang === 'ko' ? '생성' : 'Generate')}
        </button>
      </div>
    </div>
  )
}  