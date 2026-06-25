import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { format } from 'date-fns'
import AppointmentModal from '../components/AppointmentModal'

const statusStyles = {
  confirmed: { bg: '#eaf3de', color: '#3b6d11', label: 'Confirmed' },
  pending:   { bg: '#faeeda', color: '#854f0b', label: 'Pending' },
  done:      { bg: '#e6f1fb', color: '#185fa5', label: 'Done' },
  cancelled: { bg: '#fcebeb', color: '#a32d2d', label: 'Cancelled' },
}

function Badge({ status }) {
  const s = statusStyles[status] || statusStyles.pending
  return <span style={{ fontSize: 11, padding: '3px 9px', borderRadius: 20, background: s.bg, color: s.color, fontWeight: 500 }}>{s.label}</span>
}

function initials(name) {
  return name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
}

export default function Appointments() {
  const [appts, setAppts] = useState([])
  const [filter, setFilter] = useState('all')
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(null)

  useEffect(() => { load() }, [])

  async function load() {
    const { data: { user } } = await supabase.auth.getUser()
    const { data } = await supabase.from('appointments').select('*').eq('user_id', user.id).order('scheduled_at', { ascending: false })
    setAppts(data || [])
    setLoading(false)
  }

  async function deleteAppt(id) {
    if (!confirm('Delete this appointment?')) return
    await supabase.from('appointments').delete().eq('id', id)
    setAppts(prev => prev.filter(a => a.id !== id))
  }

  const filtered = filter === 'all' ? appts : appts.filter(a => a.status === filter)
  const tabs = ['all', 'confirmed', 'pending', 'done', 'cancelled']

  if (loading) return <div style={{ color: 'var(--muted)' }}>Loading…</div>

  return (
    <div>
      <div style={{ marginBottom: '1.25rem' }}>
        <h1 style={{ fontSize: 18, fontWeight: 500 }}>Appointments</h1>
        <p style={{ color: 'var(--muted)', fontSize: 13, marginTop: 2 }}>{appts.length} total</p>
      </div>

      <div style={{ background: 'var(--surface)', border: '0.5px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '1.25rem' }}>
        {/* Tabs */}
        <div style={{ display: 'flex', gap: 0, borderBottom: '0.5px solid var(--border)', marginBottom: '1rem' }}>
          {tabs.map(t => (
            <button key={t} onClick={() => setFilter(t)} style={{
              padding: '6px 14px', fontSize: 12, cursor: 'pointer',
              background: 'transparent', border: 'none',
              borderBottom: filter === t ? '2px solid var(--accent)' : '2px solid transparent',
              color: filter === t ? 'var(--accent)' : 'var(--muted)',
              fontWeight: filter === t ? 500 : 400,
              marginBottom: -1, textTransform: 'capitalize'
            }}>
              {t}
            </button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <div style={{ fontSize: 13, color: 'var(--hint)', padding: '1rem 0' }}>No appointments found.</div>
        ) : (
          filtered.map(a => (
            <div key={a.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: '0.5px solid var(--border)' }}>
              <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#e6f1fb', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 500, color: '#185fa5', flexShrink: 0 }}>
                {initials(a.client_name)}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 500 }}>{a.client_name}</div>
                <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 1 }}>
                  {a.service} · {format(new Date(a.scheduled_at), 'MMM d, yyyy h:mm a')}
                </div>
                {a.notes && <div style={{ fontSize: 11, color: 'var(--hint)', marginTop: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{a.notes}</div>}
              </div>
              <Badge status={a.status} />
              <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                <button onClick={() => setEditing(a)} style={{ fontSize: 11, padding: '4px 10px', border: '0.5px solid var(--border)', borderRadius: 'var(--radius)', background: 'transparent', color: 'var(--muted)', cursor: 'pointer' }}>Edit</button>
                <button onClick={() => deleteAppt(a.id)} style={{ fontSize: 11, padding: '4px 10px', border: '0.5px solid var(--border)', borderRadius: 'var(--radius)', background: 'transparent', color: '#a32d2d', cursor: 'pointer' }}>Delete</button>
              </div>
            </div>
          ))
        )}
      </div>

      {editing && (
        <AppointmentModal
          appointment={editing}
          onClose={(saved) => { setEditing(null); if (saved) load() }}
        />
      )}
    </div>
  )
}
