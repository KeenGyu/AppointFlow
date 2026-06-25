import { useState } from 'react'
import { supabase } from '../lib/supabase'

export default function Auth() {
  const [mode, setMode] = useState('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  async function submit() {
    if (!email || !password) { setError('Email and password are required.'); return }
    setLoading(true); setError(''); setMessage('')
    let result
    if (mode === 'login') {
      result = await supabase.auth.signInWithPassword({ email, password })
    } else {
      result = await supabase.auth.signUp({ email, password })
    }
    setLoading(false)
    if (result.error) { setError(result.error.message); return }
    if (mode === 'signup') setMessage('Account created! Check your email to confirm, then log in.')
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)' }}>
      <div style={{ width: 380, background: 'var(--surface)', borderRadius: 'var(--radius-lg)', padding: '2rem', border: '0.5px solid var(--border)' }}>
        <div style={{ marginBottom: '1.5rem' }}>
          <div style={{ fontSize: 20, fontWeight: 600 }}>AppointFlow</div>
          <div style={{ fontSize: 13, color: 'var(--muted)', marginTop: 4 }}>
            {mode === 'login' ? 'Sign in to your account' : 'Create your free account'}
          </div>
        </div>

        <div style={{ marginBottom: 12 }}>
          <label style={{ fontSize: 12, color: 'var(--muted)', display: 'block', marginBottom: 4 }}>Email</label>
          <input
            type="email" value={email} onChange={e => setEmail(e.target.value)}
            placeholder="you@example.com"
            style={{ width: '100%', padding: '9px 12px', border: '0.5px solid var(--border)', borderRadius: 'var(--radius)', background: 'var(--surface)', color: 'var(--text)' }}
          />
        </div>

        <div style={{ marginBottom: 16 }}>
          <label style={{ fontSize: 12, color: 'var(--muted)', display: 'block', marginBottom: 4 }}>Password</label>
          <input
            type="password" value={password} onChange={e => setPassword(e.target.value)}
            placeholder="Min. 6 characters"
            onKeyDown={e => e.key === 'Enter' && submit()}
            style={{ width: '100%', padding: '9px 12px', border: '0.5px solid var(--border)', borderRadius: 'var(--radius)', background: 'var(--surface)', color: 'var(--text)' }}
          />
        </div>

        {error && <div style={{ fontSize: 12, color: 'var(--danger-text)', background: 'var(--danger-bg)', padding: '8px 12px', borderRadius: 'var(--radius)', marginBottom: 12 }}>{error}</div>}
        {message && <div style={{ fontSize: 12, color: 'var(--success-text)', background: 'var(--success-bg)', padding: '8px 12px', borderRadius: 'var(--radius)', marginBottom: 12 }}>{message}</div>}

        <button onClick={submit} disabled={loading} style={{
          width: '100%', padding: '10px', background: 'var(--accent)', color: '#fff',
          border: 'none', borderRadius: 'var(--radius)', fontWeight: 500, opacity: loading ? 0.6 : 1
        }}>
          {loading ? 'Please wait…' : mode === 'login' ? 'Sign in' : 'Create account'}
        </button>

        <div style={{ textAlign: 'center', marginTop: 16, fontSize: 13, color: 'var(--muted)' }}>
          {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
          <span
            onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setError(''); setMessage('') }}
            style={{ color: 'var(--accent)', cursor: 'pointer', fontWeight: 500 }}
          >
            {mode === 'login' ? 'Sign up free' : 'Sign in'}
          </span>
        </div>
      </div>
    </div>
  )
}
