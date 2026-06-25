import { useState } from 'react'
import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import AppointmentModal from './AppointmentModal'

const navLinks = [
  { to: '/', label: 'Dashboard', icon: '▦' },
  { to: '/appointments', label: 'Appointments', icon: '📅' },
  { to: '/clients', label: 'Clients', icon: '👥' },
  { to: '/followups', label: 'Follow-ups', icon: '✉️' },
]

export default function Layout({ session }) {
  const [showModal, setShowModal] = useState(false)
  const navigate = useNavigate()

  async function signOut() {
    await supabase.auth.signOut()
    navigate('/auth')
  }

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      {/* Sidebar */}
      <aside style={{
        width: 220, flexShrink: 0,
        background: 'var(--surface)',
        borderRight: '0.5px solid var(--border)',
        display: 'flex', flexDirection: 'column',
        padding: '1rem 0'
      }}>
        <div style={{ padding: '0 1rem 1rem', borderBottom: '0.5px solid var(--border)', marginBottom: 8 }}>
          <div style={{ fontWeight: 600, fontSize: 15 }}>AppointFlow</div>
          <div style={{ fontSize: 11, color: 'var(--hint)', marginTop: 2 }}>CRM for small businesses</div>
        </div>

        <nav style={{ flex: 1 }}>
          <div style={{ fontSize: 10, color: 'var(--hint)', padding: '10px 1rem 4px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Menu</div>
          {navLinks.map(link => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to === '/'}
              style={({ isActive }) => ({
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '8px 1rem', fontSize: 13,
                textDecoration: 'none',
                color: isActive ? 'var(--accent)' : 'var(--muted)',
                background: isActive ? 'var(--accent-light)' : 'transparent',
                fontWeight: isActive ? 500 : 400,
              })}
            >
              <span>{link.icon}</span> {link.label}
            </NavLink>
          ))}
        </nav>

        <div style={{ padding: '0.75rem 1rem', borderTop: '0.5px solid var(--border)' }}>
          <div style={{ fontSize: 12, color: 'var(--hint)', marginBottom: 6, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {session.user.email}
          </div>
          <button onClick={signOut} style={{
            width: '100%', padding: '6px 10px', fontSize: 12,
            border: '0.5px solid var(--border)', borderRadius: 'var(--radius)',
            background: 'transparent', color: 'var(--muted)'
          }}>
            Sign out
          </button>
        </div>
      </aside>

      {/* Main area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <header style={{
          padding: '12px 1.5rem',
          background: 'var(--surface)',
          borderBottom: '0.5px solid var(--border)',
          display: 'flex', alignItems: 'center', justifyContent: 'flex-end'
        }}>
          <button
            onClick={() => setShowModal(true)}
            style={{
              padding: '7px 14px', fontSize: 13,
              background: 'var(--accent)', color: '#fff',
              border: 'none', borderRadius: 'var(--radius)',
              display: 'flex', alignItems: 'center', gap: 6
            }}
          >
            + New appointment
          </button>
        </header>

        <main style={{ flex: 1, overflowY: 'auto', padding: '1.5rem' }}>
          <Outlet />
        </main>
      </div>

      {showModal && <AppointmentModal onClose={() => setShowModal(false)} />}
    </div>
  )
}
