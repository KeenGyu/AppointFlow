import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { format, addDays } from 'date-fns'

export default function Followups() {
  const [followups, setFollowups] = useState([])
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ client_name: '', message: '', send_at: '', appointment_id: '' })
  const [saving, setSaving] = useState(false)

  useEffect(() => { load() }, [])

  async function load() {
    const { data: { user } } = await supabase.auth.getUser()
    const [{ data: fu }, { data: ap }] = await Promise.all([
      supabase.from('followups').select('*').eq('user_id', user.id).order('send_at'),
      supabase.from('appointments').select('id, client_name, service, scheduled_at').eq('user_id', user.id).order('scheduled_at', { ascending: false }).limit(50),
    ])
    setFollowups(fu || [])
    setAppointments(ap || [])
    setLoading(false)
  }

  async function save() {
    if (!form.client_name.trim() || !form.message.trim() || !form.send_at) return
    setSaving(true)
    const { data: { user } } = await supabase.auth.getUser()
    await supabase.from('followups').insert({
      user_id: user.id,
      client_name: form.client_name.trim(),
      message: form.message.trim(),
      send_at: new Date(form.send_at).toISOString(),
      appointment_id: form.appointment_id || null,
      status: 'scheduled',
    })
    setSaving(false)
    setShowForm(false)
    setForm({ client_name: '', message: '', send_at: '', appointment_id: '' })
    load()
  }

  async function markSent(id) {
    await supabase.from('followups').update({ status: 'sent' }).eq('id', id)
    setFollowups(prev => prev.map(f => f.id === id ? { ...f, status: 'sent' } : f))
  }

  async function deleteFollowup(id) {
    if (!confirm('Delete this follow-up?')) return
    await supabase.from('followups').delete().eq('id', id)
    setFollowups(prev => prev.filter(f => f.id !== id))
  }

  function prefillFromAppt(apptId) {
    const appt = appointments.find(a => a.id === apptId)
    if (!appt) return
    const sendDate = addDays(new Date(appt.scheduled_at), 1).toISOString().slice(0, 16)
    setForm(f => ({
      ...f,
      appointment_id: apptId,
      client_name: appt.client_name,
      message: `Hi ${appt.client_name.split(' ')[0]}! Thanks for coming in for your ${appt.service}. Hope everything went well — let us know if you have any questions. We'd love to see you again soon!`,
      send_at: sendDate,
    }))
  }

  const statusDot = { scheduled: '#EF9F27', sent: '#639922', skipped: '#a09f9b' }

  if (loading) return <div style={{ color: 'var(--muted)' }}>Loading…</div>

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
        <div>
          <h1 style={{ fontSize: 18, fontWeight: 500 }}>Follow-ups</h1>
          <p style={{ color: 'var(--muted)', fontSize: 13, marginTop: 2 }}>{followups.filter(f => f.status === 'scheduled').length} scheduled</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} style={{ padding: '7px 14px', background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: 'var(--radius)', fontSize: 13 }}>
          + New follow-up
        </button>
      </div>

      {/* New follow-up form */}
      {showForm && (
        <div style={{ background: 'var(--surface)', border: '0.5px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '1.25rem', marginBottom: '1rem' }}>
          <div style={{ fontSize: 13, fontWeight: 500, marginBottom: '1rem' }}>Schedule a follow-up</div>

          {appointments.length > 0 && (
            <div style={{ marginBottom: 12 }}>
              <label style={{ fontSize: 12, color: 'var(--muted)', display: 'block', marginBottom: 4 }}>Prefill from appointment (optional)</label>
              <select onChange={e => prefillFromAppt(e.target.value)} style={{ width: '100%', padding: '8px 10px', border: '0.5px solid var(--border)', borderRadius: 'var(--radius)', background: 'var(--surface)', color: 'var(--text)' }}>
                <option value="">— Select an appointment —</option>
                {appointments.map(a => (
                  <option key={a.id} value={a.id}>{a.client_name} · {a.service} · {format(new Date(a.scheduled_at), 'MMM d')}</option>
                ))}
              </select>
            </div>
          )}

          {[
            { label: 'Client name', key: 'client_name', type: 'text' },
            { label: 'Send date', key: 'send_at', type: 'datetime-local' },
          ].map(f => (
            <div key={f.key} style={{ marginBottom: 12 }}>
              <label style={{ fontSize: 12, color: 'var(--muted)', display: 'block', marginBottom: 4 }}>{f.label}</label>
              <input type={f.type} value={form[f.key]} onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))} style={{ width: '100%', padding: '8px 10px', border: '0.5px solid var(--border)', borderRadius: 'var(--radius)', background: 'var(--surface)', color: 'var(--text)' }} />
            </div>
          ))}

          <div style={{ marginBottom: 12 }}>
            <label style={{ fontSize: 12, color: 'var(--muted)', display: 'block', marginBottom: 4 }}>Message</label>
            <textarea value={form.message} onChange={e => setForm(p => ({ ...p, message: e.target.value }))} rows={4} style={{ width: '100%', padding: '8px 10px', border: '0.5px solid var(--border)', borderRadius: 'var(--radius)', background: 'var(--surface)', color: 'var(--text)', resize: 'vertical' }} />
          </div>

          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
            <button onClick={() => setShowForm(false)} style={{ padding: '7px 14px', border: '0.5px solid var(--border)', borderRadius: 'var(--radius)', background: 'transparent', color: 'var(--muted)', fontSize: 13 }}>Cancel</button>
            <button onClick={save} disabled={saving} style={{ padding: '7px 14px', background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: 'var(--radius)', fontSize: 13 }}>
              {saving ? 'Saving…' : 'Save follow-up'}
            </button>
          </div>
        </div>
      )}

      {/* Follow-up list */}
      <div style={{ background: 'var(--surface)', border: '0.5px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '1.25rem' }}>
        {followups.length === 0 ? (
          <div style={{ fontSize: 13, color: 'var(--hint)', padding: '1rem 0' }}>No follow-ups yet. Create one above to start tracking.</div>
        ) : (
          followups.map(f => (
            <div key={f.id} style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: '10px 0', borderBottom: '0.5px solid var(--border)' }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: statusDot[f.status], marginTop: 5, flexShrink: 0 }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 500 }}>{f.client_name}</div>
                <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 2, lineHeight: 1.5 }}>{f.message}</div>
                <div style={{ fontSize: 11, color: 'var(--hint)', marginTop: 3 }}>
                  {f.status === 'sent' ? 'Sent' : 'Scheduled for'} {format(new Date(f.send_at), 'MMM d, yyyy h:mm a')}
                </div>
              </div>
              <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                {f.status === 'scheduled' && (
                  <button onClick={() => markSent(f.id)} style={{ fontSize: 11, padding: '4px 10px', border: '0.5px solid var(--border)', borderRadius: 'var(--radius)', background: 'transparent', color: '#3b6d11', cursor: 'pointer' }}>Mark sent</button>
                )}
                <button onClick={() => deleteFollowup(f.id)} style={{ fontSize: 11, padding: '4px 10px', border: '0.5px solid var(--border)', borderRadius: 'var(--radius)', background: 'transparent', color: '#a32d2d', cursor: 'pointer' }}>Delete</button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
