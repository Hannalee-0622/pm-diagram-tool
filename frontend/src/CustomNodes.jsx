// src/CustomNodes.jsx
import React, { useState, useEffect, useRef } from 'react'
import { Handle, Position } from 'reactflow'
import 'reactflow/dist/style.css'

const NODE_WIDTH = 200
const NODE_HEIGHT = 80

export function TaskNode({ data }) {
    const [value, setValue] = useState(data.task)
    const textareaRef = useRef(null)

    // 외부로부터 task 변경이 올 경우에도 동기화
    useEffect(() => {
        setValue(data.task)
    }, [data.task])

    const commit = () => {
        if (value !== data.task) {
            data.onEdit(value)
        }
    }

    return (
        <div style={{
            width: NODE_WIDTH,
            height: NODE_HEIGHT,
            padding: 10,
            border: '1px solid #333',
            borderRadius: 4,
            background: '#fff',
            boxSizing: 'border-box',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between'
        }}>
            <div style={{ fontWeight: 'bold', marginBottom: 4 }}>{data.role}</div>

            <textarea
                ref={textareaRef}
                value={value}
                onChange={(e) => setValue(e.target.value)}
                onBlur={commit}
                onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault()
                        commit()
                        textareaRef.current.blur()
                    }
                }}
                style={{
                    flex: 1,
                    resize: 'none',
                    fontSize: 14,
                    lineHeight: 1.4,
                    border: '1px solid #ccc',
                    borderRadius: 4,
                    padding: 4,
                    width: `calc(100% - 8px)`,
                    boxSizing: 'border-box'
                }}
            />

            <div style={{ marginTop: 4, fontSize: 12, color: '#555' }}>
                추천: {data.model}
            </div>

            <Handle type="target" position={Position.Left} style={{ background: '#333' }} />
            <Handle type="source" position={Position.Right} style={{ background: '#333' }} />
        </div>
    )
}

// SectionGroup 은 그대로 두시면 됩니다
export function SectionGroup({ data, children }) {
    return (
        <div style={{
            padding: 8,
            border: '2px dashed #666',
            borderRadius: 6,
            position: 'relative',
            background: '#fafafa'
        }}>
            <div style={{
                position: 'absolute',
                top: -12,
                left: 12,
                background: '#fafafa',
                padding: '0 4px',
                fontSize: 14,
                fontWeight: 'bold'
            }}>
                {data.label || 'Section'}
            </div>
            {children}
        </div>
    )
}
