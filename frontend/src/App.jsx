import React, { useEffect, useState } from 'react'

export default function App() {
  const [items, setItems] = useState([])
  const [title, setTitle] = useState('')

  async function load() {
    const res = await fetch('/api/items')
    const data = await res.json()
    setItems(data)
  }

  useEffect(() => { load() }, [])

  async function addItem(e) {
    e.preventDefault()
    if (!title.trim()) return
    const res = await fetch('/api/items', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title })
    })
    if (res.ok) {
      setTitle('')
      await load()
    }
  }

  async function remove(id) {
    await fetch(`/api/items/${id}`, { method: 'DELETE' })
    await load()
  }

  return (
    <div style={{ maxWidth: 640, margin: '2rem auto', fontFamily: 'system-ui, Arial' }}>
      <h1>DevSecOps Demo</h1>
      <form onSubmit={addItem} style={{ display: 'flex', gap: 8 }}>
        <input value={title} onChange={e => setTitle(e.target.value)} placeholder="New item title" style={{ flex: 1, padding: 8 }} />
        <button type="submit">Add</button>
      </form>
      <ul>
        {items.map(i => (
          <li key={i.id} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <span>{i.title}</span>
            <button onClick={() => remove(i.id)} aria-label={`delete-${i.id}`}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  )
}
