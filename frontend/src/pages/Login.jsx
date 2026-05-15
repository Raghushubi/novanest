import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: '',
    password: ''
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError('');
    setLoading(true);

    try {
      const user = await login(form.email, form.password);

      navigate(user.role === 'admin' ? '/admin' : '/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px'
      }}
    >
      <div
        className="card"
        style={{
          width: '100%',
          maxWidth: '420px',
          padding: '40px'
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{ fontSize: '40px', marginBottom: '8px' }}>🔐</div>

          <h1
            style={{
              fontSize: '24px',
              fontWeight: 700,
              color: 'var(--purple2)'
            }}
          >
            Welcome Back
          </h1>

          <p
            style={{
              color: 'var(--text2)',
              fontSize: '14px',
              marginTop: '6px'
            }}
          >
            Secure login with JWT authentication
          </p>
        </div>

        <div
          style={{
            background: 'rgba(94,234,212,0.08)',
            border: '0.5px solid rgba(94,234,212,0.2)',
            borderRadius: '10px',
            padding: '10px 14px',
            marginBottom: '24px'
          }}
        >
          <p
            style={{
              fontSize: '12px',
              color: 'var(--teal)'
            }}
          >
            🛡️ Protected using bcrypt password hashing, JWT authentication, and login rate limiting.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '16px'
          }}
        >
          <div>
            <label
              style={{
                fontSize: '13px',
                color: 'var(--text2)',
                display: 'block',
                marginBottom: '6px'
              }}
            >
              Email
            </label>

            <input
              type="email"
              required
              placeholder="you@example.com"
              value={form.email}
              onChange={(e) =>
                setForm((p) => ({
                  ...p,
                  email: e.target.value
                }))
              }
            />
          </div>

          <div>
            <label
              style={{
                fontSize: '13px',
                color: 'var(--text2)',
                display: 'block',
                marginBottom: '6px'
              }}
            >
              Password
            </label>

            <input
              type="password"
              required
              placeholder="••••••••"
              value={form.password}
              onChange={(e) =>
                setForm((p) => ({
                  ...p,
                  password: e.target.value
                }))
              }
            />
          </div>

          {error && (
            <p className="error-msg">
              ⚠ {error}
            </p>
          )}

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', marginTop: '8px' }}
            disabled={loading}
          >
            {loading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>

        <p
          style={{
            textAlign: 'center',
            marginTop: '24px',
            fontSize: '14px',
            color: 'var(--text2)'
          }}
        >
          No account?{' '}
          <Link
            to="/register"
            style={{
              color: 'var(--purple2)',
              textDecoration: 'none'
            }}
          >
            Register here
          </Link>
        </p>

        <p
          style={{
            marginTop: '20px',
            fontSize: '11px',
            color: 'var(--text3)',
            textAlign: 'center'
          }}
        >
          Demo credentials are provided privately to evaluators.
        </p>
      </div>
    </div>
  );
}