import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const strength = (pw) => {
  let s = 0;
  if (pw.length >= 8) s++;
  if (/[A-Z]/.test(pw)) s++;
  if (/[0-9]/.test(pw)) s++;
  if (/[!@#$%^&*]/.test(pw)) s++;
  return s;
};
const colors = ['var(--danger)', 'var(--danger)', 'var(--warning)', 'var(--teal)', 'var(--success)'];
const labels = ['', 'Weak', 'Fair', 'Good', 'Strong'];

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [errors, setErrors] = useState([]);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const pw_strength = strength(form.password);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setErrors([]); setLoading(true);
    try {
      await register(form.username, form.email, form.password);
      setSuccess(true);
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      const data = err.response?.data;
      if (data?.errors) setErrors(data.errors);
      else setError(data?.error || 'Registration failed');
    } finally { setLoading(false); }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
      <div className="card" style={{ width: '100%', maxWidth: '440px', padding: '40px' }}>
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div style={{ fontSize: '40px', marginBottom: '8px' }}>🌸</div>
          <h1 style={{ fontSize: '24px', fontWeight: 700, color: 'var(--purple2)' }}>Create your nest</h1>
          <p style={{ color: 'var(--text2)', fontSize: '14px' }}>Join the secure universe</p>
        </div>

        {success ? (
          <div style={{ textAlign: 'center', padding: '20px' }}>
            <div style={{ fontSize: '40px' }}>✅</div>
            <p className="success-msg" style={{ fontSize: '16px', marginTop: '10px' }}>Account created! Redirecting to login...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ fontSize: '13px', color: 'var(--text2)', display: 'block', marginBottom: '6px' }}>Username</label>
              <input value={form.username} onChange={e => setForm(p => ({...p, username: e.target.value}))} placeholder="cooluser123" required />
              <p style={{ fontSize: '11px', color: 'var(--text3)', marginTop: '4px' }}>Letters, numbers, underscores. 3–20 chars.</p>
            </div>
            <div>
              <label style={{ fontSize: '13px', color: 'var(--text2)', display: 'block', marginBottom: '6px' }}>Email</label>
              <input type="email" value={form.email} onChange={e => setForm(p => ({...p, email: e.target.value}))} placeholder="you@example.com" required />
            </div>
            <div>
              <label style={{ fontSize: '13px', color: 'var(--text2)', display: 'block', marginBottom: '6px' }}>Password</label>
              <input type="password" value={form.password} onChange={e => setForm(p => ({...p, password: e.target.value}))} placeholder="Min 8 chars, uppercase, number, special" required />
              {form.password && (
                <div style={{ marginTop: '8px' }}>
                  <div style={{ display: 'flex', gap: '4px', marginBottom: '4px' }}>
                    {[1,2,3,4].map(i => (
                      <div key={i} style={{ flex: 1, height: '3px', borderRadius: '2px', background: i <= pw_strength ? colors[pw_strength] : 'var(--bg3)', transition: 'all 0.3s' }} />
                    ))}
                  </div>
                  <p style={{ fontSize: '11px', color: colors[pw_strength] }}>{labels[pw_strength]}</p>
                </div>
              )}
            </div>
            {errors.map((e, i) => <p key={i} className="error-msg">⚠ {e.msg}</p>)}
            {error && <p className="error-msg">⚠ {error}</p>}
            <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
              {loading ? 'Creating...' : 'Create Account 🚀'}
            </button>
          </form>
        )}

        <p style={{ textAlign: 'center', marginTop: '20px', fontSize: '14px', color: 'var(--text2)' }}>
          Already have an account? <Link to="/login" style={{ color: 'var(--purple2)', textDecoration: 'none' }}>Sign in</Link>
        </p>
      </div>
    </div>
  );
}
