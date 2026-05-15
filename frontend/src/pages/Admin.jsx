import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';
import api from '../utils/api';

export default function Admin() {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [allNotes, setAllNotes] = useState([]);
  const [logs, setLogs] = useState([]);
  const [tab, setTab] = useState('users');

  if (user?.role !== 'admin') return <Navigate to="/dashboard" />;

  useEffect(() => {
    api.get('/users').then(r => setUsers(r.data)).catch(() => {});
    api.get('/users/admin/notes').then(r => setAllNotes(r.data)).catch(() => {});
    api.get('/security/logs').then(r => setLogs(r.data)).catch(() => {});
  }, []);

  const tabs = ['users', 'notes', 'logs'];

  return (
    <div style={{ maxWidth: '960px', margin: '0 auto', padding: '32px 24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
        <h1 style={{ fontSize: '26px', fontWeight: 700, color: 'var(--teal)' }}>Admin Panel</h1>
        <span className="badge badge-teal">RBAC: admin only</span>
      </div>
      <p style={{ color: 'var(--text2)', marginBottom: '24px', fontSize: '14px' }}>
        This page is protected by role-based access control. The backend verifies the JWT role claim on every request.
      </p>
      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', borderBottom: '0.5px solid var(--border)', paddingBottom: '12px' }}>
        {tabs.map(t => (
          <button key={t} onClick={() => setTab(t)} className={"btn " + (tab === t ? 'btn-primary' : 'btn-ghost')} style={{ fontSize: '13px', padding: '6px 16px', textTransform: 'capitalize' }}>{t}</button>
        ))}
      </div>
      {tab === 'users' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {users.map(u => (
            <div key={u.id} className="card" style={{ padding: '14px 20px', display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: u.role === 'admin' ? 'rgba(94,234,212,0.2)' : 'rgba(168,148,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: u.role === 'admin' ? 'var(--teal)' : 'var(--purple2)', flexShrink: 0 }}>
                {u.username[0].toUpperCase()}
              </div>
              <div style={{ flex: 1 }}>
                <span style={{ fontWeight: 600, color: 'var(--text)' }}>{u.username}</span>
                <span style={{ color: 'var(--text3)', fontSize: '13px', marginLeft: '10px' }}>{u.email}</span>
              </div>
              <span className={"badge " + (u.role === 'admin' ? 'badge-teal' : 'badge-purple')}>{u.role}</span>
            </div>
          ))}
        </div>
      )}
      {tab === 'notes' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {allNotes.map(n => (
            <div key={n.id} className="card" style={{ padding: '14px 20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <span style={{ fontWeight: 600 }}>{n.title}</span>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <span className="badge badge-purple">{n.username}</span>
                  {n.is_encrypted && <span className="badge badge-pink">locked</span>}
                </div>
              </div>
              <p style={{ fontSize: '13px', color: 'var(--text2)' }}>{n.is_encrypted ? '[Encrypted]' : n.content.slice(0, 120)}</p>
            </div>
          ))}
        </div>
      )}
      {tab === 'logs' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {logs.map(l => (
            <div key={l.id} style={{ display: 'flex', gap: '12px', padding: '10px 14px', background: 'var(--card)', borderRadius: '10px', border: '0.5px solid var(--border)', fontSize: '13px' }}>
              <span className={"badge " + (l.event_type === 'LOGIN_SUCCESS' ? 'badge-success' : l.event_type === 'LOGIN_FAIL' ? 'badge-danger' : 'badge-purple')}>{l.event_type}</span>
              <span style={{ color: 'var(--text2)', flex: 1 }}>{l.username || 'anon'} - {l.details}</span>
              <span style={{ color: 'var(--text3)' }}>{new Date(l.created_at).toLocaleString()}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
