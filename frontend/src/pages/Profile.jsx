import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';

export default function Profile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [file, setFile] = useState(null);
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');
  const ALLOWED = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

  useEffect(() => {
    api.get('/users/me').then(r => setProfile(r.data)).catch(() => {});
  }, []);

  const handleFileChange = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    // CLIENT-SIDE file type check (server also validates)
    if (!ALLOWED.includes(f.type)) {
      setError('⚠ Invalid file type. Only JPEG, PNG, GIF, WEBP allowed.');
      setFile(null);
      return;
    }
    if (f.size > 2 * 1024 * 1024) {
      setError('⚠ File too large. Max 2MB.');
      setFile(null);
      return;
    }
    setError('');
    setFile(f);
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) return;
    const fd = new FormData();
    fd.append('avatar', file);
    try {
      const { data } = await api.post('/users/avatar', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      setMsg('Avatar updated! ✨');
      setProfile(p => ({ ...p, avatar_filename: data.filename }));
    } catch (err) {
      setError(err.response?.data?.error || 'Upload failed');
    }
  };

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', padding: '32px 24px' }}>
      <h1 style={{ fontSize: '26px', fontWeight: 700, color: 'var(--purple2)', marginBottom: '8px' }}>👤 Profile</h1>
      <p style={{ color: 'var(--text2)', marginBottom: '28px', fontSize: '14px' }}>File upload is validated by MIME type and size — both client-side and server-side.</p>

      <div className="card" style={{ padding: '28px' }}>
        {/* Avatar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '28px' }}>
          <div style={{ width: '72px', height: '72px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--purple), var(--teal))', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', flexShrink: 0 }}>
            {profile?.avatar_filename
              ? <img src={`/uploads/${profile.avatar_filename}`} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              : <span style={{ fontSize: '28px', fontWeight: 700, color: '#fff' }}>{user?.username?.[0]?.toUpperCase()}</span>
            }
          </div>
          <div>
            <p style={{ fontWeight: 600, fontSize: '18px', color: 'var(--text)' }}>{profile?.username}</p>
            <p style={{ color: 'var(--text2)', fontSize: '14px' }}>{profile?.email}</p>
            <span className={`badge ${profile?.role === 'admin' ? 'badge-teal' : 'badge-purple'}`} style={{ marginTop: '6px' }}>{profile?.role}</span>
          </div>
        </div>

        {/* File upload */}
        <div style={{ padding: '16px', background: 'rgba(168,148,255,0.06)', borderRadius: '12px', border: '0.5px solid var(--border)' }}>
          <h3 style={{ fontSize: '14px', fontWeight: 600, marginBottom: '12px' }}>📎 Upload Avatar</h3>
          <div style={{ fontSize: '12px', color: 'var(--text3)', marginBottom: '10px' }}>
            Allowed: JPEG, PNG, GIF, WEBP · Max 2MB · Validated by MIME type (not just extension)
          </div>
          <form onSubmit={handleUpload} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <input type="file" accept="image/*" onChange={handleFileChange} style={{ cursor: 'pointer' }} />
            {error && <p className="error-msg">{error}</p>}
            {msg && <p className="success-msg">{msg}</p>}
            <button type="submit" className="btn btn-primary" disabled={!file}>Upload 📤</button>
          </form>
        </div>

        {/* Account info */}
        <div style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {[
            ['Member since', new Date(profile?.created_at).toLocaleDateString()],
            ['Password storage', 'bcrypt hash (cost factor 12) — never stored in plaintext'],
            ['Session tokens', 'JWT access (15min) + Refresh token (7 days, rotated)'],
          ].map(([k, v]) => (
            <div key={k} style={{ display: 'flex', gap: '12px', fontSize: '13px', padding: '8px 0', borderBottom: '0.5px solid var(--border)' }}>
              <span style={{ color: 'var(--text3)', minWidth: '140px' }}>{k}</span>
              <span style={{ color: 'var(--text2)' }}>{v}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
