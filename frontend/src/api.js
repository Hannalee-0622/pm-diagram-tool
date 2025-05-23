// src/api.js
export async function fetchDiagram({ keyword, lang, start_date, end_date }) {
    const res = await fetch('/api/generate-plan/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ keyword, lang, start_date, end_date }),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'API Error');
    return json;    // { nodeDataArray: [...], linkDataArray: [...] }
}
// ↓ 이 부분을 바로 아래에 추가하세요 ↓
export async function updateDiagram(id, spec) {
    const res = await fetch(`/api/diagrams/${id}/`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ spec }),
    });
    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail || 'Update failed');
    }
    return res.json();
}