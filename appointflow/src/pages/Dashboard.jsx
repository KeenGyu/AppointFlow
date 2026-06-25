import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { format, isToday } from 'date-fns'

const statusStyles = {
  confirmed: { bg: '#eaf3de', color: '#3b6d11', label: 'Confirmed' },
  pending:   { bg: '#faeeda', color: '#854f0b', label: 'Pending' },
  done:      { bg: '#e6f1fb', color: '#185fa5', label: 'Done' },
  cancelled: { bg: '#fcebeb', color: '#a32d2d', label: 'Cancelled' },
}

function Badge({ status }) {
  const s = statusStyles[status] || statusStyles.pending
  return (
    <span style={{ fontSize: 11, padding: '3px 9px', borderRadius: 20, background: s.bg, color: s.color, fontWeight: 500, whiteSpace: 'nowrap' }}>
      {s.label}
    </span>
  )
}

function initials(name) {
  return name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
}

export default function Dashboard() {
  const [todayAppts, setTodayAppts] = useState([])
  const [stats, setStats] = useState({ total: 0, confirmed: 0, followups: 0, noshow: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => { load() }, [])

  async function load() {
    const { data: { user } } = await supabase.auth.getUser()
    const now = new Date()
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString()
    const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1).toISOString()

    const [{ data: appts }, { data: followups }, { data: allAppts }] = await Promise.all([
      supabase.from('appointments').select('*').eq('user_id', user.id).gte('scheduled_at', todayStart).lt('scheduled_at', todayEnd).order('scheduled_at'),
      supabase.from('followups').select('id').eq('user_id', user.id),
      supabase.from('appointments').select('status').eq('user_id', user.id),
    ])

    setTodayAppts(appts || [])
    const total = allAppts?.length || 0
    const confirmed = allAppts?.filter(a => a.status === 'confirmed').length || 0
    const noshow = allAppts?.filter(a => a.status === 'cancelled').length || 0
    setStats({ total, confirmed, followups: followups?.length || 0, noshow })
    setLoading(false)
  }

  const statCards = [
    { label: "Today's appointments", value: todayAppts.length, sub: `${todayAppts.filter(a=>a.status==='pending').length} pending` },
    { label: 'Total appointments', value: stats.total, sub: `${stats.confirmed} confirmed` },
    { label: 'Follow-ups sent', value: stats.followups, sub: 'All time' },
    { label: 'Cancelled', value: stats.noshow, sub: 'All time' },
  ]

  if (loading) return <div style={{ color: 'var(--muted)', padding: '2rem' }}>Loading…</div>

  return (
    <div>
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: 18, fontWeight: 500 }}>Dashboard</h1>
        <p style={{ color: 'var(--muted)', fontSize: 13, marginTop: 2 }}>{format(new Date(), 'EEEE, MMMM d, yyyy')}</p>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: '1.5rem' }}>
        {statCards.map(s => (
          <div key={s.label} style={{ background: 'var(--surface)', border: '0.5px solid var(--border)', borderRadius: 'var(--radius)', padding: '1rem' }}>
            <div style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 4 }}>{s.label}</div>
            <div style={{ fontSize: 24, fontWeight: 500 }}>{s.value}</div>
            <div style={{ fontSize: 11, color: 'var(--hint)', marginTop: 2 }}>{s.sub}</div>
          </div>
        ))}
      </div>

      {/* Today's schedule */}
      <div style={{ background: 'var(--surface)', border: '0.5px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '1.25rem' }}>
        <div style={{ fontSize: 13, fontWeight: 500, marginBottom: '1rem' }}>Today's schedule</div>
        {todayAppts.length === 0 ? (
          <div style={{ fontSize: 13, color: 'var(--hint)', padding: '1rem 0' }}>No appointments today. Click "+ New appointment" to add one.</div>
        ) : (
          todayAppts.map(a => (
            <div key={a.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: '0.5px solid var(--border)' }}>
              <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--accent-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 500, color: 'var(--accent-text)', flexShrink: 0 }}>
                {initials(a.client_name)}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 500 }}>{a.client_name}</div>
                <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 1 }}>{a.service} · {format(new Date(a.scheduled_at), 'h:mm a')}</div>
              </div>
              <Badge status={a.status} />
            </div>
          ))
        )}
      </div>
    </div>
  )
}
