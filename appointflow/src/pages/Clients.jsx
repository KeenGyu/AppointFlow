import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { format } from 'date-fns'

function initials(name) {
  return name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
}

export default function Clients() {
  const [clients, setClients] = useState([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => { load() }, [])

  async function load() {
    const { data: { user } } = await supabase.auth.getUser()
    // Aggregate unique clients from appointments
    const { data } = await supabase
      .from('appointments')
      .select('client_name, service, scheduled_at, status')
      .eq('user_id', user.id)
      .order('scheduled_at', { ascending: false })

    if (!data) { setLoading(false); return }

    // Group by client name
    const map = {}
    data.forEach(a => {
      if (!map[a.client_name]) {
        map[a.client_name] = { name: a.client_name, service: a.service, visits: 0, last: null }
      }
      map[a.client_name].visits++
      if (!map[a.client_name].last || new Date(a.scheduled_at) > new Date(map[a.client_name].last)) {
        map[a.client_name].last = a.scheduled_at
        map[a.client_name].service = a.service
      }
    })

    setClients(Object.values(map).sort((a, b) => b.visits - a.visits))
    setLoading(false)
  }

  const filtered = clients.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.service.toLowerCase().includes(search.toLowerCase())
  )

  if (loading) return <div style={{ color: 'var(--muted)' }}>Loading…</div>

  return (
    <div>
      <div style={{ marginBottom: '1.25rem' }}>
        <h1 style={{ fontSize: 18, fontWeight: 500 }}>Clients</h1>
        <p style={{ color: 'var(--muted)', fontSize: 13, marginTop: 2 }}>{clients.length} unique clients from your appointments</p>
      </div>

      <div style={{ background: 'var(--surface)', border: '0.5px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '1.25rem' }}>
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search by name or service…"
          style={{ width: '100%', padding: '8px 12px', border: '0.5px solid var(--border)', borderRadius: 'var(--radius)', background: 'var(--surface)', color: 'var(--text)', marginBottom: '1rem' }}
        />

        {filtered.length === 0 ? (
          <div style={{ fontSize: 13, color: 'var(--hint)', padding: '1rem 0' }}>
            {clients.length === 0 ? 'No clients yet. Add appointments to start tracking clients.' : 'No clients match your search.'}
          </div>
        ) : (
          filtered.map(c => (
            <div key={c.name} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: '0.5px solid var(--border)' }}>
              <div style={{ width: 38, height: 38, borderRadius: '50%', background: '#e6f1fb', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 500, color: '#185fa5', flexShrink: 0 }}>
                {initials(c.name)}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 500 }}>{c.name}</div>
                <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 1 }}>
                  {c.service} · {c.visits} visit{c.visits !== 1 ? 's' : ''}
                  {c.last && ` · Last: ${format(new Date(c.last), 'MMM d, yyyy')}`}
                </div>
              </div>
              <div style={{ fontSize: 11, background: '#e6f1fb', color: '#185fa5', padding: '3px 9px', borderRadius: 20, fontWeight: 500 }}>
                {c.visits}x
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
