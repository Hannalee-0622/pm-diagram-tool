// src/main.jsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { ReactFlowProvider } from 'reactflow'
import App from './App'
import DiagramPage from './DiagramPage'

ReactDOM.createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <ReactFlowProvider>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/diagram/:id" element={<DiagramPage />} />
      </Routes>
    </ReactFlowProvider>
  </BrowserRouter>
)