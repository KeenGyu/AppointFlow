import { useState } from 'react'
import { supabase } from '../lib/supabase'

export default function AppointmentModal({ onClose, appointment = null }) {
  const [form, setForm] = useState({
    client_name: appointment?.client_name || '',
    service: appointment?.service || '',
    scheduled_at: appointment?.scheduled_at
      ? new Date(appointment.scheduled_at).toISOString().slice(0, 16)
      : '',
    status: appointment?.status || 'pending',
    notes: appointment?.notes || '',
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  function set(k, v) { setForm(f => ({ ...f, [k]: v })) }

  async function save() {
    if (!form.client_name.trim() || !form.service.trim() || !form.scheduled_at) {
      setError('Name, service, and date/time are required.')
      return
    }
    setSaving(true)
    setError('')
    const { data: { user } } = await supabase.auth.getUser()

    const payload = {
      user_id: user.id,
      client_name: form.client_name.trim(),
      service: form.service.trim(),
      scheduled_at: new Date(form.scheduled_at).toISOString(),
      status: form.status,
      notes: form.notes.trim(),
    }

    let err
    if (appointment) {
      ({ error: err } = await supabase.from('appointments').update(payload).eq('id', appointment.id))
    } else {
      ({ error: err } = await supabase.from('appointments').insert(payload))
    }

    setSaving(false)
    if (err) { setError(err.message); return }
    onClose(true)
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100
    }}>
      <div style={{
        background: 'var(--surface)', borderRadius: 'var(--radius-lg)',
        padding: '1.5rem', width: 420, maxWidth: '95vw',
        boxShadow: '0 8px 32px rgba(0,0,0,0.12)'
      }}>
        <div style={{ fontSize: 15, fontWeight: 500, marginBottom: '1rem' }}>
          {appointment ? 'Edit appointment' : 'New appointment'}
        </div>

        {[
          { label: 'Client name', key: 'client_name', type: 'text', placeholder: 'e.g. Maria Santos' },
          { label: 'Service', key: 'service', type: 'text', placeholder: 'e.g. Deep tissue massage' },
          { label: 'Date & time', key: 'scheduled_at', type: 'datetime-local' },
        ].map(f => (
          <div key={f.key} style={{ marginBottom: 12 }}>
            <label style={{ fontSize: 12, color: 'var(--muted)', display: 'block', marginBottom: 4 }}>{f.label}</label>
            <input
              type={f.type}
              value={form[f.key]}
              placeholder={f.placeholder || ''}
              onChange={e => set(f.key, e.target.value)}
              style={{ width: '100%', padding: '8px 10px', border: '0.5px solid var(--border)', borderRadius: 'var(--radius)', background: 'var(--surface)', color: 'var(--text)' }}
            />
          </div>
        ))}

        <div style={{ marginBottom: 12 }}>
          <label style={{ fontSize: 12, color: 'var(--muted)', display: 'block', marginBottom: 4 }}>Status</label>
          <select
            value={form.status}
            onChange={e => set('status', e.target.value)}
            style={{ width: '100%', padding: '8px 10px', border: '0.5px solid var(--border)', borderRadius: 'var(--radius)', background: 'var(--surface)', color: 'var(--text)' }}
          >
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="done">Done</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        <div style={{ marginBottom: 12 }}>
          <label style={{ fontSize: 12, color: 'var(--muted)', display: 'block', marginBottom: 4 }}>Notes</label>
          <textarea
            value={form.notes}
            onChange={e => set('notes', e.target.value)}
            rows={3}
            placeholder="Optional notes…"
            style={{ width: '100%', padding: '8px 10px', border: '0.5px solid var(--border)', borderRadius: 'var(--radius)', background: 'var(--surface)', color: 'var(--text)', resize: 'vertical' }}
          />
        </div>

        {error && <div style={{ fontSize: 12, color: 'var(--danger-text)', marginBottom: 10 }}>{error}</div>}

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 4 }}>
          <button onClick={() => onClose(false)} style={{ padding: '7px 14px', border: '0.5px solid var(--border)', borderRadius: 'var(--radius)', background: 'transparent', color: 'var(--muted)' }}>
            Cancel
          </button>
          <button onClick={save} disabled={saving} style={{ padding: '7px 14px', background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: 'var(--radius)', opacity: saving ? 0.6 : 1 }}>
            {saving ? 'Saving…' : 'Save appointment'}
          </button>
        </div>
      </div>
    </div>
  )
}
