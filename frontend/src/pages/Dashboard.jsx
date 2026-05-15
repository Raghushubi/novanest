import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import api from '../utils/api';

export default function Dashboard() {
  const { user } = useAuth();
  const [notes, setNotes] = useState([]);
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    api.get('/notes').then(r => setNotes(r.data)).catch(() => {});
    api.get('/security/logs/me').then(r => setLogs(r.data.slice(0, 5))).catch(() => {});
  }, []);

  const stats = [
    { label: 'Total Notes', value: notes.length, icon: '📝', color: 'var(--purple2)' },
    { label: 'Encrypted', value: notes.filter(n => n.is_encrypted).length, icon: '🔒', color: 'var(--teal)' },
    { label: 'Login Events', value: logs.filter(l => l.event_type === 'LOGIN_SUCCESS').length, icon: '✅', color: 'var(--success)' },
    { label: 'Role', value: user?.role?.toUpperCase(), icon: '🎭', color: 'var(--pink)' },
  ];

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '32px 24px' }}>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 700, color: 'var(--purple2)' }}>
          Welcome back, {user?.username} ✨
        </h1>
        <p style={{ color: 'var(--text2)', marginTop: '6px' }}>Your secure digital home · JWT authenticated · Role: <span className="badge badge-purple">{user?.role}</span></p>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px', marginBottom: '32px' }}>
        {stats.map(s => (
          <div key={s.label} className="card" style={{ padding: '20px', textAlign: 'center' }}>
            <div style={{ fontSize: '28px', marginBottom: '8px' }}>{s.icon}</div>
            <div style={{ fontSize: '24px', fontWeight: 700, color: s.color }}>{s.value}</div>
            <div style={{ fontSize: '13px', color: 'var(--text2)', marginTop: '4px' }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Security badges */}
      <div className="card" style={{ padding: '20px', marginBottom: '24px' }}>
        <h2 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text)', marginBottom: '12px' }}>🛡️ Active Security Features</h2>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          {['JWT Access Tokens', 'bcrypt Password Hashing', 'Refresh Token Rotation', 'Rate Limiting', 'CORS Protection', 'Helmet HTTP Headers', 'Input Validation (server)', 'XSS Sanitization (DOMPurify)', 'SQLi Prevention (parameterized queries)', 'AES-256 Note Encryption', 'File Type Validation', 'Ownership Authorization'].map(f => (
            <span key={f} className="badge badge-teal" style={{ fontSize: '11px' }}>✓ {f}</span>
          ))}
        </div>
      </div>

      {/* Quick links */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
        <Link to="/notes" style={{ textDecoration: 'none' }}>
          <div className="card" style={{ padding: '20px', cursor: 'pointer' }}>
            <div style={{ fontSize: '24px', marginBottom: '8px' }}>📝</div>
            <div style={{ fontWeight: 600, color: 'var(--text)' }}>My Notes</div>
            <div style={{ fontSize: '13px', color: 'var(--text2)', marginTop: '4px' }}>Create & manage secure notes</div>
          </div>
        </Link>
        <Link to="/security" style={{ textDecoration: 'none' }}>
          <div className="card" style={{ padding: '20px', cursor: 'pointer' }}>
            <div style={{ fontSize: '24px', marginBottom: '8px' }}>🔍</div>
            <div style={{ fontWeight: 600, color: 'var(--text)' }}>Security Log</div>
            <div style={{ fontSize: '13px', color: 'var(--text2)', marginTop: '4px' }}>View your login history</div>
          </div>
        </Link>
      </div>
    </div>
  );
}
